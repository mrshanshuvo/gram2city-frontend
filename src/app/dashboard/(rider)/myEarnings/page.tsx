'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import { fetchRiderParcels } from '@/features/parcels/api';
import { fetchRiderCashouts } from '@/features/finance/api';
import { Parcel } from '@/features/parcels/types';
import { Cashout } from '@/features/finance/types';
import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiFilter,
  FiArrowUpRight,
  FiCalendar,
  FiPackage,
} from 'react-icons/fi';
import moment from 'moment';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { usePageHeader } from '@/hooks/usePageHeader';
import { axiosSecure } from '@/api/axios';
import toast from 'react-hot-toast';

const timeFilters = ['today', 'week', 'month', 'all'];

const isWithinRange = (date: string | undefined, range: string) => {
  if (!date) return false;
  const now = moment();
  const d = moment(date);
  switch (range) {
    case 'today':
      return d.isSame(now, 'day');
    case 'week':
      return d.isAfter(now.clone().subtract(7, 'days'));
    case 'month':
      return d.isSame(now, 'month');
    default:
      return true;
  }
};

const MyEarnings = () => {
  const { user } = useAuthStore();
  const [selectedRange, setSelectedRange] = useState('all');
  const queryClient = useQueryClient();

  usePageHeader('Rider Wallet', 'Track your mission earnings and payouts');

  const payoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await axiosSecure.post('/riders/payout', { amount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashouts', user?.email] });
      toast.success('Payout request submitted!', { icon: '💰' });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit request');
    },
  });

  const handleRequestPayout = () => {
    // In a real app, this might show a modal to confirm the amount
    // For now, we'll request the full pending balance
    const amount = pendingEarning;
    if (amount < 500) return;

    if (confirm(`Request payout of ৳${amount.toLocaleString()}?`)) {
      payoutMutation.mutate(amount);
    }
  };

  const { data: deliveredParcels = [], isLoading: loadingParcels } = useQuery({
    queryKey: ['deliveredParcels', user?.email],
    enabled: !!user?.email,
    queryFn: () => {
      if (!user?.email) return [];
      return fetchRiderParcels(user.email, 'delivered');
    },
  });

  const { data: cashoutsData = [], isLoading: loadingCashouts } = useQuery({
    queryKey: ['cashouts', user?.email],
    enabled: !!user?.email,
    queryFn: () => {
      if (!user?.email) return [];
      return fetchRiderCashouts(user.email);
    },
  });

  const { totalEarning, cashedOutEarning, pendingEarning, filteredDeliveries } = useMemo(() => {
    const cashouts = Array.isArray(cashoutsData)
      ? cashoutsData
      : (cashoutsData as { data?: Cashout[] }).data || [];

    const parcelsList = Array.isArray(deliveredParcels) ? deliveredParcels : [];

    const filteredDelivered = (parcelsList as Parcel[]).filter((p) =>
      isWithinRange(p.delivered_at, selectedRange),
    );

    const total = filteredDelivered.reduce((sum, p) => sum + (p.rider_earning || 0), 0);
    const cashedOut = cashouts.reduce((sum: number, c: Cashout) => sum + (c.earning || 0), 0);
    const pending = total - cashedOut;

    return {
      totalEarning: total,
      cashedOutEarning: cashedOut,
      pendingEarning: Math.max(0, pending),
      filteredDeliveries: filteredDelivered,
    };
  }, [deliveredParcels, cashoutsData, selectedRange]);

  if (loadingParcels || loadingCashouts) {
    return (
      <div className="space-y-8">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* Filter Section */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
        {timeFilters.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              selectedRange === range
                ? 'bg-secondary text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <FiDollarSign />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total Earned
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            ৳{totalEarning.toLocaleString()}
          </h3>
          <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <FiArrowUpRight /> Lifetime revenue
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <FiCheckCircle />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Paid Out
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            ৳{cashedOutEarning.toLocaleString()}
          </h3>
          <p className="text-xs font-bold text-blue-500 dark:text-blue-400 mt-2 flex items-center gap-1">
            Transferred to bank
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:shadow-amber-500/5 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <FiClock />
            </div>
            <button
              disabled={pendingEarning < 500}
              onClick={() => handleRequestPayout()}
              className="btn btn-xs bg-amber-500 hover:bg-amber-600 text-white border-none rounded-lg px-3 font-black uppercase tracking-tighter disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 transition-all cursor-pointer"
            >
              Withdraw
            </button>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            ৳{pendingEarning.toLocaleString()}
          </h3>
          <p className="text-xs font-bold text-amber-500 dark:text-amber-400 mt-2 flex items-center gap-1">
            {pendingEarning < 500 ? '৳500 min. required' : 'Ready for withdrawal'}
          </p>
        </div>
      </div>

      {/* Mission History */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiCalendar className="text-blue-500" /> Mission Log ({selectedRange})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50 dark:divide-slate-800">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Mission
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Delivered At
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Earning
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredDeliveries.map((parcel) => (
                <tr
                  key={parcel._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                        <FiPackage />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                          {parcel.parcelName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          ID: {parcel.trackingId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {parcel.receiverName}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {parcel.receiverDistrict}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {moment(parcel.delivered_at).format('MMM D, YYYY')}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {moment(parcel.delivered_at).format('h:mm A')}
                    </div>
                  </td>
                  <td className="px-6 py-6 font-black text-emerald-600 dark:text-emerald-400">
                    ৳{parcel.rider_earning?.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 text-[10px] font-black rounded-full uppercase tracking-widest">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                      <FiFilter size={32} />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold italic">
                      No completed missions in this time range.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyEarnings;
