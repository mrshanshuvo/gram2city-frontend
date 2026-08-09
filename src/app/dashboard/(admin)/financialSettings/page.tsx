'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import toast from 'react-hot-toast';
import { FiSave, FiInfo, FiPercent, FiTruck, FiLayers } from 'react-icons/fi';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { fetchSystemSettings, updateSystemSettings } from '@/features/admin/api';
import { SystemSettings } from '@/features/admin/types';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosSecure } from '@/api/axios';

import { Payout } from '@/types';
import { financialSettingsSchema, FinancialSettingsFormValues } from '@/features/admin/schema';

const FinancialSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current settings
  const { data, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => fetchSystemSettings(),
  });

  const { register, handleSubmit, reset } = useForm<FinancialSettingsFormValues>({
    resolver: zodResolver(financialSettingsSchema) as Resolver<FinancialSettingsFormValues>,
  });

  // Fetch Payouts
  const { data: payoutsData } = useQuery<Payout[]>({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const res = await axiosSecure.get('/admin/payouts');
      return res.data.data;
    },
  });

  const payouts = payoutsData || [];

  // Payout Status Mutation
  const payoutStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosSecure.patch(`/admin/payouts/${id}/status`, {
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      toast.success('Payout status updated!');
    },
  });

  const handlePayoutStatus = (id: string, status: string) => {
    if (confirm(`Are you sure you want to ${status} this payout?`)) {
      payoutStatusMutation.mutate({ id, status });
    }
  };

  useEffect(() => {
    if (data) {
      reset({
        base_delivery_fee: data.base_delivery_fee,
        cost_per_kg: data.cost_per_kg,
        rider_commission_percentage: data.rider_commission_percentage,
      });
    }
  }, [data, reset]);

  // Mutation for updating settings
  const updateSettings = useMutation({
    mutationFn: (newSettings: SystemSettings) => updateSystemSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Financial settings updated successfully!');
      setIsUpdating(false);
    },
    onError: () => {
      toast.error('Failed to update settings. Please try again.');
      setIsUpdating(false);
    },
  });

  const onSubmit = (data: FinancialSettingsFormValues) => {
    setIsUpdating(true);
    updateSettings.mutate(data);
  };

  if (isLoading) return <SkeletonLoader type="table" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-outfit">
      <div>
        <h2 className="text-3xl font-black text-gray-800 dark:text-slate-100 tracking-tight">
          Financial Infrastructure
        </h2>
        <p className="text-gray-500 dark:text-slate-400 font-medium">
          Configure global pricing, commission models, and revenue splits.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-8">
            {/* Base Fee */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiTruck className="text-primary" />
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                  Base Delivery Fee (৳)
                </label>
              </div>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                {...register('base_delivery_fee', { valueAsNumber: true })}
                className="input w-full bg-gray-50 dark:bg-slate-800/80 border-none rounded-2xl h-14 font-bold text-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                The starting price for any delivery under 1kg.
              </p>
            </div>

            {/* Cost Per KG */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiLayers className="text-primary" />
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                  Extra Weight Charge (৳/kg)
                </label>
              </div>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                {...register('cost_per_kg', { valueAsNumber: true })}
                className="input w-full bg-gray-50 dark:bg-slate-800/80 border-none rounded-2xl h-14 font-bold text-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                Additional cost applied for each kilogram above the base weight.
              </p>
            </div>

            {/* Rider Commission */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiPercent className="text-primary" />
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                  Rider Earning Percentage (%)
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  {...register('rider_commission_percentage', {
                    valueAsNumber: true,
                  })}
                  className="input w-full bg-gray-50 dark:bg-slate-800/80 border-none rounded-2xl h-14 font-bold text-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 dark:text-slate-500">
                  %
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                Percentage of the total cost that goes directly to the rider. The remaining amount
                is Admin Profit.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 gap-2 cursor-pointer"
            >
              <FiSave className="text-lg" />
              {isUpdating ? 'Updating Infrastructure...' : 'Deploy Financial Changes'}
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
              <FiInfo />
              <span className="text-xs font-black uppercase tracking-widest">Pricing Logic</span>
            </div>
            <div className="space-y-4 text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
              <p>Total Cost = Base Fee + (Weight - 1) × Extra Charge</p>
              <div className="h-px bg-amber-200/50 dark:bg-amber-900/60 w-full"></div>
              <p>Rider Earning = Total Cost × {data?.rider_commission_percentage}%</p>
              <p>Admin Revenue = Total Cost - Rider Earning</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
              <FiInfo />
              <span className="text-xs font-black uppercase tracking-widest">Global Impact</span>
            </div>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
              Changes applied here will immediately affect all new parcel bookings across the
              platform.
              <span className="block mt-2 font-bold">
                Past bookings will remain unaffected to preserve invoice integrity.
              </span>
            </p>
          </div>
        </div>
      </form>

      {/* Payout Management Section */}
      <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-slate-800">
        <div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-slate-100 tracking-tight">
            Rider Payout Requests
          </h3>
          <p className="text-gray-500 dark:text-slate-400 font-medium">
            Review and process mission earnings withdrawal requests.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                    Rider
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                    Requested At
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {payouts.map((payout: Payout) => (
                  <tr
                    key={payout._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-100">
                        {payout.rider_name}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        {payout.rider_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ৳{payout.amount}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-slate-400">
                      {new Date(payout.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          payout.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
                            : payout.status === 'approved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40'
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePayoutStatus(payout._id, 'approved')}
                            className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-lg font-black uppercase cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePayoutStatus(payout._id, 'rejected')}
                            className="btn btn-xs bg-rose-500 hover:bg-rose-600 text-white border-none rounded-lg font-black uppercase cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-gray-400 dark:text-slate-500 font-bold italic text-sm"
                    >
                      No pending payout requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettings;
