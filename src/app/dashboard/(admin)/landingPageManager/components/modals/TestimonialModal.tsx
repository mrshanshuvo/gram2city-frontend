'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { X, Save, User, MessageSquare, Star, Upload, Loader2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Testimonial } from '@/features/landing/types';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData | Testimonial) => void;
  initialData?: Testimonial;
  isLoading?: boolean;
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialData || { name: '', title: '', quote: '', rating: 5, isActive: true },
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: '', title: '', quote: '', rating: 5, isActive: true });
      setPreviewUrl(initialData?.image || '');
      setSelectedFile(null);
    }
  }, [initialData, isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (formValues: Testimonial) => {
    if (!selectedFile && !initialData?.image) {
      toast.error('Please upload a client avatar.');
      return;
    }
    let avatarUrl = initialData?.image || '';
    if (selectedFile) {
      try {
        const { uploadDirectToCloudinary } = await import('@/lib/cloudinary');
        avatarUrl = await uploadDirectToCloudinary(selectedFile, 'gram2city/cms');
      } catch (err) {
        console.warn('Direct upload failed; falling back to multipart form:', err);
        const fd = new FormData();
        fd.append('image', selectedFile);
        Object.entries(formValues).forEach(([key, value]) => {
          if (value !== undefined && value !== null) fd.append(key, String(value));
        });
        onSubmit(fd);
        return;
      }
    }
    onSubmit({ ...formValues, image: avatarUrl });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {initialData ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Curate customer success stories
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="p-8 space-y-6 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center gap-4 md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group bg-white shadow-inner border-2 border-dashed border-slate-200"
                  >
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        fill
                        sizes="96px"
                        className="w-full h-full object-cover"
                        alt="Client"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Client Avatar
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Square images look best · PNG, JPG or WebP (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={12} /> Client Name
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. John Doe"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Briefcase size={12} /> Client Title / Role
                  </label>
                  <input
                    {...register('title')}
                    placeholder="e.g. CEO at TechCorp"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MessageSquare size={12} /> The Quote
                  </label>
                  <textarea
                    {...register('quote', { required: 'Quote is required' })}
                    rows={4}
                    placeholder="What did they say about Gram2City?"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Star size={12} /> Rating (1-5)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[1-5]"
                    {...register('rating', { valueAsNumber: true, min: 1, max: 5 })}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900">Visibility Status</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Control if this testimonial is live on the site
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="sr-only peer"
                      defaultChecked={initialData?.isActive !== false}
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-4 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl text-slate-500 font-black hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-3.5 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} /> Save Testimonial
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TestimonialModal;
