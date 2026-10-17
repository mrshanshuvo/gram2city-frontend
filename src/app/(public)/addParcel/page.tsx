'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller, Resolver, FieldPath } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiZap, FiPackage, FiMapPin, FiUser, FiCheck, FiArrowRight, FiTruck } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/authStore';
import { axiosSecure } from '@/api/axios';
import { useQuery } from '@tanstack/react-query';
import { fetchWarehouses } from '@/features/landing/api';
import { queryKeys } from '@/lib/queryKeys';
import { useTrackingLogger } from '@/features/parcels/hooks';
import { usePageHeader } from '@/hooks/usePageHeader';
import { ParcelFormData, Area } from '@/features/parcels/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { parcelSchema, ParcelFormValues } from '@/features/parcels/schema';

const generateTrackingId = () => Math.random().toString(36).substring(2, 10).toUpperCase();

const STEPS = [
  { id: 1, label: 'Parcel Details', icon: <FiPackage /> },
  { id: 2, label: 'Pickup Info', icon: <FiMapPin /> },
  { id: 3, label: 'Delivery Info', icon: <FiUser /> },
];

const AddParcel: React.FC = () => {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelSchema) as unknown as Resolver<ParcelFormValues>,
    defaultValues: {
      parcelType: 'Not-Document',
      weight: '0.1',
      requiredVehicle: 'bike',
      parcelName: '',
      senderName: user?.displayName || '',
      senderContact: user?.phone || '',
      senderRegion: '',
      senderDistrict: '',
      senderServiceCenter: '',
      senderAddress: '',
      receiverName: '',
      receiverContact: '',
      receiverRegion: '',
      receiverDistrict: '',
      receiverServiceCenter: '',
      deliveryAddress: '',
    },
  });
  usePageHeader('Create New Shipment', 'Fast, reliable door-to-door delivery');

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<ParcelFormData | null>(null);
  const router = useRouter();
  const { logTracking } = useTrackingLogger();

  const { data: serviceAreas = [] } = useQuery<Area[]>({
    queryKey: queryKeys.landing.warehouses(),
    queryFn: fetchWarehouses,
  });

  const { data: systemSettings } = useQuery({
    queryKey: ['system-settings-public'],
    queryFn: async () => {
      const res = await axiosSecure.get('/public/settings').catch(() => null);
      return res?.data?.settings || { base_delivery_fee: 50, cost_per_kg: 20 };
    },
    staleTime: 300000,
  });

  const baseDeliveryFee = systemSettings?.base_delivery_fee ?? 50;
  const costPerKg = systemSettings?.cost_per_kg ?? 20;

  useEffect(() => {
    const predefinedWeight = searchParams?.get('predefinedWeight');
    if (predefinedWeight) {
      setValue('weight', predefinedWeight);
      setValue('parcelType', 'Not-Document');
    }
  }, [searchParams, setValue]);

  const regionsData = serviceAreas.reduce<Record<string, string[]>>((acc, area) => {
    if (!acc[area.region]) acc[area.region] = [];
    if (!acc[area.region].includes(area.district)) acc[area.region].push(area.district);
    return acc;
  }, {});
  const regions = Object.keys(regionsData);
  const getDistricts = (region: string) => regionsData[region] || [];
  const getCities = (district: string) =>
    serviceAreas.find((a: Area) => a.district === district)?.covered_area || [];

  const parcelType = watch('parcelType', 'Not-Document');
  const weight = parseFloat(watch('weight') || '0') || 0;
  const senderRegion = watch('senderRegion');
  const senderDistrict = watch('senderDistrict');
  const receiverRegion = watch('receiverRegion');
  const receiverDistrict = watch('receiverDistrict');

  const requiredVehicle = watch('requiredVehicle', 'bike');

  const calculateCost = (): number => {
    const vehicleMultipliers: Record<string, number> = {
      bike: 1,
      car: 1.5,
      mini_pickup: 2.2,
      large_pickup: 3.5,
    };
    const multiplier = vehicleMultipliers[requiredVehicle] || 1;

    const baseCost = baseDeliveryFee + (weight > 1 ? (weight - 1) * costPerKg : 0);
    return Math.round(baseCost * multiplier);
  };

  const liveCost = calculateCost();
  const isSameDistrict = senderDistrict === receiverDistrict && !!senderDistrict;
  const extraWeight = weight > 1 ? Number((weight - 1).toFixed(1)) : 0;

  const onSubmit: SubmitHandler<ParcelFormValues> = (data) => {
    setFormData(data as unknown as ParcelFormData);
    setIsConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    const cost = calculateCost();

    try {
      const trackingId = generateTrackingId();
      const parcelData = {
        ...formData,
        receiverPhone: formData.receiverContact,
        senderPhone: formData.senderContact,
        cost,
        created_by: user?.email,
        payment_status: 'unpaid',
        delivery_status: 'not_collected',
        creation_date: new Date().toISOString(),
        trackingId,
      };
      const res = await axiosSecure.post('/parcels', parcelData);
      if (res.data.id) {
        await logTracking({
          trackingId,
          status: 'not_collected',
          details: `Parcel booked by ${user?.displayName}`,
          location: formData.senderServiceCenter,
          updated_by: user?.email || '',
        });
        toast.success('Parcel booked successfully!');
        setIsConfirmOpen(false);
        router.push('/dashboard/myParcels');
      }
    } catch {
      toast.error('Failed to book parcel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-medium text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-secondary transition-all';
  const labelCls =
    'block text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-1.5';
  const errorCls = 'mt-1.5 text-xs font-semibold text-red-500';

  // Shadcn-powered select wired to react-hook-form via Controller
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
        name={name as FieldPath<ParcelFormValues>}
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
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item} value={item}>
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

  return (
    <div className="max-w-5xl mx-auto px-2 py-4 md:pt-16 md:pb-20">
      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2.5 group ${step >= s.id ? 'opacity-100' : 'opacity-40'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-sm ${step > s.id ? 'bg-primary text-white' : step === s.id ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'}`}
              >
                {step > s.id ? <FiCheck /> : s.icon}
              </div>
              <span
                className={`text-xs font-black uppercase tracking-widest hidden sm:block ${step === s.id ? 'text-secondary' : 'text-gray-400'}`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-4 transition-colors ${step > s.id ? 'bg-primary' : 'bg-gray-100'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Parcel Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FiPackage />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">
                        Parcel Details
                      </h2>
                      <p className="text-xs text-gray-400 font-medium">What are you sending?</p>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Parcel Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Document', 'Not-Document'].map((type) => (
                        <label
                          key={type}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${parcelType === type ? 'border-secondary bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
                        >
                          <input
                            type="radio"
                            {...register('parcelType')}
                            value={type}
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${parcelType === type ? 'border-secondary bg-secondary' : 'border-gray-300'}`}
                          >
                            {parcelType === type && (
                              <span className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800">
                              {type === 'Document' ? 'Document' : 'Non-Document'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {type === 'Document' ? 'Flat rate ৳60–80' : 'From ৳110 + weight'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {parcelType === 'Not-Document' && (
                    <div>
                      <label className={labelCls}>
                        Weight (kg){' '}
                        {searchParams?.get('predefinedWeight') && (
                          <span className="text-green-500 normal-case font-bold ml-1">
                            ← Estimator applied
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          {...register('weight')}
                          className={inputCls}
                          placeholder="0.0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                          KG
                        </span>
                        {searchParams?.get('predefinedWeight') && (
                          <div className="absolute -top-2.5 right-2 flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-full">
                            <FiZap size={8} /> Auto
                          </div>
                        )}
                      </div>
                      {errors.weight && (
                        <p className={errorCls}>{errors.weight.message as React.ReactNode}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>Parcel Description</label>
                    <input
                      type="text"
                      {...register('parcelName')}
                      className={inputCls}
                      placeholder="e.g. Important documents, laptop, clothes..."
                    />
                    {errors.parcelName && (
                      <p className={errorCls}>{errors.parcelName.message as React.ReactNode}</p>
                    )}
                  </div>

                  {/* Vehicle Selection */}
                  <div>
                    <label className={labelCls}>Select Delivery Vehicle</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          id: 'bike',
                          label: 'Bike',
                          icon: <FiPackage />,
                          price: '1x',
                        },
                        {
                          id: 'car',
                          label: 'Car',
                          icon: <FiZap />,
                          price: '1.5x',
                        },
                        {
                          id: 'mini_pickup',
                          label: 'Mini Pickup',
                          icon: <FiTruck />,
                          price: '2.2x',
                        },
                        {
                          id: 'large_pickup',
                          label: 'Large Truck',
                          icon: <FiTruck />,
                          price: '3.5x',
                        },
                      ].map((v) => (
                        <label
                          key={v.id}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${requiredVehicle === v.id ? 'border-secondary bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
                        >
                          <input
                            type="radio"
                            {...register('requiredVehicle')}
                            value={v.id}
                            className="hidden"
                          />
                          <div
                            className={`text-xl mb-1 ${requiredVehicle === v.id ? 'text-secondary' : 'text-gray-400'}`}
                          >
                            {v.icon}
                          </div>
                          <p className="text-[10px] font-black uppercase text-gray-800">
                            {v.label}
                          </p>
                          <p className="text-[8px] font-bold text-gray-400">{v.price} Rate</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Merchant Specifics */}
                  {user?.role === 'merchant' && (
                    <div>
                      <label className={labelCls}>Cash on Delivery (COD) Amount</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          {...register('codAmount')}
                          className={inputCls}
                          placeholder="Amount to collect from customer"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                          ৳
                        </span>
                      </div>
                      {errors.codAmount && (
                        <p className={errorCls}>{errors.codAmount.message as React.ReactNode}</p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full h-12 bg-secondary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Continue to Pickup Info <FiArrowRight />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Pickup Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FiMapPin />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-gray-900 tracking-tight">
                        Pickup Information
                      </h2>
                      <p className="text-xs text-gray-400 font-medium">
                        Where are we picking up from?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Your Name</label>
                      <input
                        type="text"
                        {...register('senderName')}
                        className={inputCls}
                        placeholder="Full name"
                      />
                      {errors.senderName && (
                        <p className={errorCls}>{errors.senderName.message as React.ReactNode}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Contact Number</label>
                      <input
                        type="tel"
                        {...register('senderContact')}
                        className={inputCls}
                        placeholder="01XXXXXXXXX"
                      />
                      {errors.senderContact && (
                        <p className={errorCls}>
                          {errors.senderContact.message as React.ReactNode}
                        </p>
                      )}
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
                    {senderDistrict && (
                      <div>
                        <label className={labelCls}>Nearest Hub</label>
                        <ControlledSelect
                          name="senderServiceCenter"
                          placeholder="Select hub"
                          items={getCities(senderDistrict)}
                          error={errors.senderServiceCenter}
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Full Address</label>
                      <input
                        type="text"
                        {...register('senderAddress')}
                        className={inputCls}
                        placeholder="House #, Road #, Area..."
                      />
                      {errors.senderAddress && (
                        <p className={errorCls}>{errors.senderAddress.message}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Pickup Instructions</label>
                      <textarea
                        {...register('pickupInstruction')}
                        className={`${inputCls} min-h-22.5 resize-none`}
                        placeholder="e.g. Call before arrival, leave with reception..."
                      />
                      {errors.pickupInstruction && (
                        <p className={errorCls}>{errors.pickupInstruction.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 px-6 border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 h-12 bg-secondary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-lg shadow-blue-500/20"
                    >
                      Continue to Delivery Info <FiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Delivery Info */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <FiUser />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">
                        Delivery Information
                      </h2>
                      <p className="text-xs text-gray-400 font-medium">Who is receiving this?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Recipient Name</label>
                      <input
                        type="text"
                        {...register('receiverName')}
                        className={inputCls}
                        placeholder="Full name"
                      />
                      {errors.receiverName && (
                        <p className={errorCls}>{errors.receiverName.message as React.ReactNode}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Contact Number</label>
                      <input
                        type="tel"
                        {...register('receiverContact')}
                        className={inputCls}
                        placeholder="01XXXXXXXXX"
                      />
                      {errors.receiverContact && (
                        <p className={errorCls}>
                          {errors.receiverContact.message as React.ReactNode}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Region</label>
                      <ControlledSelect
                        name="receiverRegion"
                        placeholder="Select region"
                        items={regions}
                        onValueChange={() => setValue('receiverDistrict', '')}
                        error={errors.receiverRegion}
                      />
                    </div>
                    {receiverRegion && (
                      <div>
                        <label className={labelCls}>District</label>
                        <ControlledSelect
                          name="receiverDistrict"
                          placeholder="Select district"
                          items={getDistricts(receiverRegion)}
                          onValueChange={() => setValue('receiverServiceCenter', '')}
                          error={errors.receiverDistrict}
                        />
                      </div>
                    )}
                    {receiverDistrict && (
                      <div>
                        <label className={labelCls}>Nearest Hub</label>
                        <ControlledSelect
                          name="receiverServiceCenter"
                          placeholder="Select hub"
                          items={getCities(receiverDistrict)}
                          error={errors.receiverServiceCenter}
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Full Address</label>
                      <input
                        type="text"
                        {...register('deliveryAddress')}
                        className={inputCls}
                        placeholder="House #, Road #, Area..."
                      />
                      {errors.deliveryAddress && (
                        <p className={errorCls}>
                          {errors.deliveryAddress.message as React.ReactNode}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Delivery Instructions</label>
                      <textarea
                        {...register('deliveryInstruction')}
                        className={`${inputCls} min-h-22.5 resize-none`}
                        placeholder="e.g. Leave with neighbor, call on arrival..."
                      />
                      {errors.deliveryInstruction && (
                        <p className={errorCls}>
                          {errors.deliveryInstruction.message as React.ReactNode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="h-12 px-6 border border-gray-200 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-12 bg-secondary hover:bg-[#2563eb] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="loading loading-spinner loading-sm" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Calculate & Book Shipment <FiZap />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div className="bg-secondary text-white rounded-3xl p-6 shadow-xl shadow-blue-900/20 sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Live Estimate
              </p>
              <div className="text-3xl font-bold tracking-tight mb-4">৳{liveCost}</div>

              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Parcel type</span>
                  <span>{parcelType === 'Document' ? 'Document' : 'Non-Document'}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Route</span>
                  <span>{isSameDistrict ? 'Within district' : 'Cross-district'}</span>
                </div>
                {parcelType !== 'Document' && weight > 0 && (
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Weight</span>
                    <span>{weight.toFixed(1)} kg</span>
                  </div>
                )}
                {extraWeight > 0 && (
                  <div className="flex justify-between text-xs font-bold text-amber-400">
                    <span>Extra weight ({extraWeight} kg)</span>
                    <span>+৳{Math.round(extraWeight * costPerKg)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Estimated Pickup
                </p>
                <p className="text-sm font-semibold text-slate-300">Today, 4:00 PM – 7:00 PM</p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-3">
                Pricing Rules
              </p>
              <ul className="space-y-2">
                {[
                  `Base delivery fee: ৳${baseDeliveryFee} (up to 1 kg)`,
                  `Weight surcharge: ৳${costPerKg}/kg beyond 1 kg`,
                  'Vehicle rates: Bike (1.0×), Car (1.5×)',
                  'Cargo rates: Mini Pickup (2.2×), Large (3.5×)',
                ].map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 text-xs font-medium text-blue-700"
                  >
                    <FiCheck className="mt-0.5 shrink-0 text-blue-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </form>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-white max-h-[90vh] overflow-y-auto">
          <div className="relative z-10">
            <DialogHeader className="p-8 pb-4">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Confirm Shipment Details
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Please verify the information below. Once confirmed, your tracking ID will be
                generated.
              </DialogDescription>
            </DialogHeader>

            <div className="px-8 pb-8 space-y-6">
              {/* Detailed Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Pickup From
                  </h4>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-bold text-slate-800">{formData?.senderName}</p>
                    <p className="text-xs text-gray-500">{formData?.senderContact}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {formData?.senderAddress}
                    </p>
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      <FiMapPin className="text-secondary shrink-0" size={12} />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {formData?.senderServiceCenter} Hub
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Deliver To
                  </h4>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-bold text-gray-900">{formData?.receiverName}</p>
                    <p className="text-xs text-gray-500">{formData?.receiverContact}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {formData?.deliveryAddress}
                    </p>
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      <FiUser className="text-primary shrink-0" size={12} />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {formData?.receiverServiceCenter} Hub
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parcel Summary Box */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Type
                    </p>
                    <p className="text-xs font-bold text-slate-800">{formData?.parcelType}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Vehicle
                    </p>
                    <p className="text-xs font-bold text-secondary capitalize">
                      {formData?.requiredVehicle?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Weight
                    </p>
                    <p className="text-xs font-bold text-slate-800">{formData?.weight} kg</p>
                  </div>
                  {formData?.codAmount && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-500 mb-1">
                        COD Amount
                      </p>
                      <p className="text-xs font-bold text-amber-600">৳{formData.codAmount}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Final Cost Box (No Gradient) */}
              <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">
                    Estimated Cost
                  </p>
                  <p className="text-xs text-blue-600/70">
                    {isSameDistrict ? 'Inside District' : 'Outside District'} •{' '}
                    {extraWeight > 0 ? `Incl. ${extraWeight}kg extra` : 'Base Weight (1kg)'}
                  </p>
                </div>
                <div className="text-4xl font-bold text-secondary tracking-tight">৳{liveCost}</div>
              </div>
            </div>

            <DialogFooter className="px-8 pb-8 pt-0 sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="h-14 px-8 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="h-14 px-10 bg-secondary hover:bg-[#2563eb] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Processing Shipment...
                  </>
                ) : (
                  <>
                    Confirm & Book Shipment <FiCheck />
                  </>
                )}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import Guard from '@/routes/PrivateRoute';
import { Suspense } from 'react';
import PageLoader from '@/components/Shared/PageLoader';

export default function Page() {
  return (
    <Guard>
      <Suspense fallback={<PageLoader />}>
        <AddParcel />
      </Suspense>
    </Guard>
  );
}
