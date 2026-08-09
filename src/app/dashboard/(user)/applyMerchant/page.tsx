'use client';

import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { axiosSecure } from '@/api/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { FiShoppingBag, FiTruck, FiMapPin, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { usePageHeader } from '@/hooks/usePageHeader';
import { MerchantFormValues } from '@/types';

const MerchantApplication = () => {
  const router = useRouter();
  usePageHeader(
    'B2B Enterprise Application',
    'Transform your shop into a high-volume logistics partner',
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MerchantFormValues>();

  const mutation = useMutation({
    mutationFn: async (data: MerchantFormValues) => {
      const res = await axiosSecure.post('/merchants', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Application submitted! Our team will review it within 24 hours.');
      router.push('/dashboard');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit application');
    },
  });

  const onSubmit = (data: MerchantFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 font-outfit">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Form Side */}
          <div className="p-12 space-y-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Shop Verification
              </h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                Official Merchant Enrollment
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2">
                  Business / Shop Name
                </label>
                <div className="relative">
                  <input
                    {...register('businessName', {
                      required: 'Business name is required',
                    })}
                    className="input w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-14 pl-12 font-bold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                    placeholder="e.g. Dhaka Tech Store"
                  />
                  <FiShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xl" />
                </div>
                {errors.businessName && (
                  <p className="text-rose-500 text-[10px] font-bold ml-2 uppercase">
                    {errors.businessName.message}
                  </p>
                )}
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2">
                  Business Category
                </label>
                <select
                  {...register('businessType', { required: true })}
                  className="select w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-14 font-bold text-slate-700 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="electronics" className="bg-white dark:bg-slate-900">
                    Electronics & Gadgets
                  </option>
                  <option value="fashion" className="bg-white dark:bg-slate-900">
                    Fashion & Lifestyle
                  </option>
                  <option value="grocery" className="bg-white dark:bg-slate-900">
                    Groceries & Essentials
                  </option>
                  <option value="healthcare" className="bg-white dark:bg-slate-900">
                    Healthcare & Pharmacy
                  </option>
                  <option value="other" className="bg-white dark:bg-slate-900">
                    Other Commercial
                  </option>
                </select>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2">
                  Official Contact Number
                </label>
                <div className="relative">
                  <input
                    {...register('contactNumber', { required: true })}
                    className="input w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-14 pl-12 font-bold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                    placeholder="01XXXXXXXXX"
                  />
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xl" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2">
                  Physical Shop Address
                </label>
                <div className="relative">
                  <textarea
                    {...register('shopAddress', { required: true })}
                    className="textarea w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 font-bold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-25 outline-none resize-none"
                    placeholder="Full street address, Floor, Building..."
                  />
                  <FiMapPin className="absolute left-4 top-6 text-slate-300 dark:text-slate-600 text-xl" />
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 cursor-pointer"
              >
                {mutation.isPending ? 'Transmitting...' : 'Submit Application'}
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="bg-slate-900 dark:bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden border-l border-slate-800">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>

            <div className="space-y-10 relative z-10">
              <div>
                <h4 className="text-3xl font-black tracking-tighter leading-none mb-4">
                  Enterprise <br />
                  Benefits
                </h4>
                <div className="h-1 w-12 bg-primary rounded-full"></div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <FiTruck />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">Priority Pickup</p>
                    <p className="text-xs text-slate-400 font-medium">
                      Daily scheduled pickups for bulk shipments.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">COD Settlement</p>
                    <p className="text-xs text-slate-400 font-medium">
                      Cash collection with automated bank transfers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <FiShoppingBag />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">Business Portal</p>
                    <p className="text-xs text-slate-400 font-medium">
                      Dedicated dashboard with advanced analytics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Review Process
              </p>
              <p className="text-xs font-bold text-slate-300">
                Your application will be vetted by our trade compliance team. Check your
                notifications for the status update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantApplication;
