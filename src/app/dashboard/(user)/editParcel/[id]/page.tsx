'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { FiPackage, FiMapPin, FiUser, FiCheck, FiArrowRight, FiEdit } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWarehouses } from '@/features/landing/api';
import { fetchParcelById, updateParcelDetails } from '@/features/parcels/api';
import { queryKeys } from '@/lib/queryKeys';
import { usePageHeader } from '@/hooks/usePageHeader';
import { Area } from '@/features/parcels/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { parcelSchema, ParcelFormValues } from '@/features/parcels/schema';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';

const STEPS = [
  { id: 1, label: 'Parcel Details', icon: <FiPackage /> },
  { id: 2, label: 'Pickup Info', icon: <FiMapPin /> },
  { id: 3, label: 'Delivery Info', icon: <FiUser /> },
];

const EditParcel: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelSchema),
  });

  usePageHeader('Edit Shipment', 'Update your parcel details before collection');

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Service Areas
  const { data: serviceAreas = [] } = useQuery<Area[]>({
    queryKey: queryKeys.landing.warehouses(),
    queryFn: fetchWarehouses,
  });

  // Fetch Parcel Data
  const { data: parcel, isLoading: isParcelLoading } = useQuery({
    queryKey: ['parcel', id],
    queryFn: () => fetchParcelById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (parcel) {
      // Map backend fields back to form fields
      reset({
        parcelName: parcel.parcelName,
        parcelType: parcel.parcelType,
        weight: parcel.weight,
        senderName: parcel.senderName,
        senderContact: parcel.senderPhone || parcel.senderContact,
        senderRegion: parcel.senderRegion,
        senderDistrict: parcel.senderDistrict,
        senderServiceCenter: parcel.senderServiceCenter,
        senderAddress: parcel.senderAddress,
        pickupInstruction: parcel.pickupInstruction,
        receiverName: parcel.receiverName,
        receiverContact: parcel.receiverPhone || parcel.receiverPhoneNumber,
        receiverRegion: parcel.receiverRegion,
        receiverDistrict: parcel.receiverDistrict,
        receiverServiceCenter: parcel.receiverServiceCenter,
        deliveryAddress: parcel.deliveryAddress,
        deliveryInstruction: parcel.deliveryInstruction,
      });
    }
  }, [parcel, reset]);

  const regionsData = serviceAreas.reduce<Record<string, string[]>>((acc, area) => {
    if (!acc[area.region]) acc[area.region] = [];
    if (!acc[area.region].includes(area.district)) acc[area.region].push(area.district);
    return acc;
  }, {});
  const regions = Object.keys(regionsData);
  const getDistricts = (region: string) => regionsData[region] || [];

  const parcelType = watch('parcelType');
  const weight = parseFloat(watch('weight') || '0') || 0;
  const senderRegion = watch('senderRegion');
  const senderDistrict = watch('senderDistrict');
  const receiverDistrict = watch('receiverDistrict');

  const calculateCost = (): number => {
    const isSameDistrict = senderDistrict === receiverDistrict && !!senderDistrict;
    if (parcelType === 'Document') return isSameDistrict ? 60 : 80;
    let cost = isSameDistrict ? 110 : 150;
    if (weight > 3) {
      const extra = Math.ceil(weight - 3);
      cost += extra * 40;
      if (!isSameDistrict) cost += 40;
    }
    return cost;
  };

  const liveCost = calculateCost();

  const onSubmit: SubmitHandler<ParcelFormValues> = async (data) => {
    if (!id) return;
    setIsSubmitting(true);

    try {
      await updateParcelDetails(id, data);
      toast.success('Parcel updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['parcel', id] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.parcels.list(user?.email || undefined),
      });
      router.push('/dashboard/myParcels');
    } catch {
      toast.error('Failed to update parcel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-medium text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 transition-all';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5';
  const errorCls = 'mt-1.5 text-xs font-semibold text-rose-500';

  const ControlledSelect = ({
    name,
    placeholder,
    onValueChange,
    error,
    items,
    disabled,
  }: {
    name: keyof ParcelFormValues;
    placeholder: string;
    onValueChange?: (value: string) => void;
    error?: { message?: string };
    items: string[];
    disabled?: boolean;
  }) => (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value as string}
            onValueChange={(val) => {
              field.onChange(val);
              onValueChange?.(val);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-2xl h-12">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
              {items.map((item) => (
                <SelectItem
                  key={item}
                  value={item}
                  className="focus:bg-slate-50 dark:focus:bg-slate-800"
                >
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className={errorCls}>{error.message}</p>}
    </div>
  );

  if (isParcelLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
        <SkeletonLoader type="card" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-2 py-4 md:pt-16 md:pb-20 font-outfit">
      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2.5 group cursor-pointer ${step >= s.id ? 'opacity-100' : 'opacity-40'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-sm ${step > s.id ? 'bg-primary text-white' : step === s.id ? 'bg-secondary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}
              >
                {step > s.id ? <FiCheck /> : s.icon}
              </div>
              <span
                className={`text-xs font-black uppercase tracking-widest hidden sm:block ${step === s.id ? 'text-[#1E5AA8] dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-4 transition-colors ${step > s.id ? 'bg-primary' : 'bg-gray-100 dark:bg-slate-800'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FiEdit />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-gray-900 dark:text-slate-100 tracking-tight">
                        Update Parcel Details
                      </h2>
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                        Modify your shipment before pickup
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Parcel Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Document', 'Not-Document'].map((type) => (
                        <label
                          key={type}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${parcelType === type ? 'border-[#1E5AA8] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 bg-gray-50 dark:bg-slate-800'}`}
                        >
                          <input
                            type="radio"
                            {...register('parcelType')}
                            value={type}
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${parcelType === type ? 'border-[#1E5AA8] dark:border-blue-500 bg-secondary' : 'border-gray-300 dark:border-slate-600'}`}
                          >
                            {parcelType === type && (
                              <span className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800 dark:text-slate-100">
                              {type === 'Document' ? 'Document' : 'Non-Document'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {parcelType === 'Not-Document' && (
                    <div>
                      <label className={labelCls}>Weight (kg)</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          {...register('weight')}
                          className={inputCls}
                          placeholder="0.0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 dark:text-slate-500">
                          KG
                        </span>
                      </div>
                      {errors.weight && <p className={errorCls}>{errors.weight.message}</p>}
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>Parcel Description</label>
                    <input
                      type="text"
                      {...register('parcelName')}
                      className={inputCls}
                      placeholder="e.g. Important documents, laptop..."
                    />
                    {errors.parcelName && <p className={errorCls}>{errors.parcelName.message}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full h-12 bg-secondary hover:bg-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    Continue to Pickup Info <FiArrowRight />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FiMapPin />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-gray-900 dark:text-slate-100 tracking-tight">
                        Pickup Information
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Your Name</label>
                      <input type="text" {...register('senderName')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Region</label>
                      <ControlledSelect
                        name="senderRegion"
                        placeholder="Select region"
                        items={regions}
                        onValueChange={() => setValue('senderDistrict', '')}
                        error={errors.senderRegion}
                      />
                    </div>
                    {senderRegion && (
                      <div>
                        <label className={labelCls}>District</label>
                        <ControlledSelect
                          name="senderDistrict"
                          placeholder="Select district"
                          items={getDistricts(senderRegion)}
                          onValueChange={() => setValue('senderServiceCenter', '')}
                          error={errors.senderDistrict}
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Full Address</label>
                      <input type="text" {...register('senderAddress')} className={inputCls} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 px-6 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 h-12 bg-secondary hover:bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue to Delivery Info <FiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <FiUser />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-gray-900 dark:text-slate-100 tracking-tight">
                        Delivery Information
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Recipient Name</label>
                      <input type="text" {...register('receiverName')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Contact Number</label>
                      <input type="tel" {...register('receiverContact')} className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Full Address</label>
                      <input type="text" {...register('deliveryAddress')} className={inputCls} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="h-12 px-6 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-12 bg-primary hover:bg-secondary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                    >
                      {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 shadow-xl sticky top-24 border border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Updated Estimate
              </p>
              <div className="text-3xl font-black tracking-tight mb-4 text-blue-400">
                ৳{liveCost}
              </div>
              <div className="space-y-2.5 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Parcel type</span>
                  <span>{parcelType === 'Document' ? 'Document' : 'Non-Document'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Weight</span>
                  <span>{weight.toFixed(1)} kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditParcel;
