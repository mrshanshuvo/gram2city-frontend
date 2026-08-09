'use client';

import { useState } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { submitFeedback } from '@/features/users/api';
import { FiStar, FiMessageCircle, FiCheckCircle, FiHeart } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feedbackSchema, FeedbackFormValues } from '@/features/users/schema';

const Feedback = () => {
  const { user } = useAuthStore();
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, reset, watch } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 5,
      category: 'service',
      comment: '',
    },
  });

  const commentValue = watch('comment') || '';
  const ratingValue = watch('rating');

  const onSubmit = async (data: FeedbackFormValues) => {
    setLoading(true);
    try {
      await submitFeedback({
        userName: user?.displayName || undefined,
        ...data,
      });

      Swal.fire({
        title: 'Thank You!',
        text: 'Your feedback helps us make Gram2City better for everyone.',
        icon: 'success',
        confirmButtonColor: '#CAEB66',
      });

      reset();
    } catch {
      Swal.fire('Error', 'Failed to submit feedback. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 font-outfit">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <FiHeart className="text-4xl animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 dark:text-slate-100 tracking-tight">
          How are we doing?
        </h2>
        <p className="text-gray-400 dark:text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
          Your feedback fuels our progress
        </p>
      </div>

      {/* Feedback Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none p-8 md:p-12 border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
          {/* Rating Section */}
          <div className="space-y-4 text-center">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Global Satisfaction
            </p>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-all duration-300 hover:scale-125 active:scale-95 cursor-pointer"
                    >
                      <FiStar
                        className={`text-4xl ${
                          (hover || field.value) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 dark:text-slate-800'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              )}
            />
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
              {ratingValue === 5
                ? 'Incredible experience!'
                : ratingValue === 4
                  ? 'Great job, small tweaks needed.'
                  : ratingValue === 3
                    ? "It's okay, could be better."
                    : "We're sorry to hear that."}
            </p>
          </div>

          {/* Category Selection */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-2">
              Primary Focus
            </p>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['service', 'app', 'rider', 'other'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => field.onChange(cat)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        field.value === cat
                          ? 'bg-gray-900 dark:bg-primary text-white dark:text-slate-950 shadow-xl shadow-gray-900/20 dark:shadow-primary/20 scale-[1.02]'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Comment Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Detailed Insights
              </p>
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
                {commentValue.length} / 500
              </span>
            </div>
            <textarea
              {...register('comment')}
              placeholder="What can we improve? Share your thoughts with our engineering team..."
              className="w-full h-40 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl p-8 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <FiCheckCircle className="text-xl" /> Transmit Feedback
              </>
            )}
          </button>
        </form>
      </div>

      {/* Proof of Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-primary">
            <FiMessageCircle className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-800 dark:text-slate-100 uppercase tracking-widest">
              24/7 Monitoring
            </p>
            <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tighter mt-0.5">
              Reviewed by our management team
            </p>
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-primary">
            <FiCheckCircle className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-800 dark:text-slate-100 uppercase tracking-widest">
              Closed-Loop System
            </p>
            <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tighter mt-0.5">
              We act on every verified suggestion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
