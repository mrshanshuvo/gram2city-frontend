'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import toast from 'react-hot-toast';
import { fetchRiderCashouts, requestCashout } from '@/features/finance/api';
import { fetchRiderParcels } from '@/features/parcels/api';
import { Parcel } from '@/features/parcels/types';
import { Cashout } from '@/features/finance/types';

import moment from 'moment';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { usePageHeader } from '@/hooks/usePageHeader';
import { FiCheckCircle, FiPackage, FiCalendar } from 'react-icons/fi';

const CompletedDeliveries = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  usePageHeader('Completed Missions', 'Archive of fulfilled deliveries and cashout status');

  // Fetch delivered parcels
  const { data: parcels = [], isLoading } = useQuery<Parcel[]>({
    queryKey: ['completedDeliveries', user?.email],
    enabled: !!user?.email,
    queryFn: () => {
      if (!user?.email) return [];
      return fetchRiderParcels(user.email, 'delivered');
    },
  });

  // Fetch cashed out parcel IDs
  const { data: cashedOut = [] } = useQuery<string[]>({
    queryKey: ['cashedOut', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      if (!user?.email) return [];
      const data = (await fetchRiderCashouts(user.email)) as Cashout[];
      return data.map((item) => item.parcel_id);
    },
  });

  // Mutation for instant cashout
  const cashoutMutation = useMutation({
    mutationFn: (parcelId: string) => requestCashout(parcelId),
    onSuccess: () => {
      toast.success('Cash out successful');
      queryClient.invalidateQueries({
        queryKey: ['completedDeliveries', user?.email],
      });
      queryClient.invalidateQueries({ queryKey: ['cashedOut', user?.email] });
    },
    onError: (err: unknown) => {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Cash out failed';
      toast.error(errorMessage);
    },
  });

  // Calculate total earnings
  const parcelList = Array.isArray(parcels) ? parcels : [];
  const totalEarnings = parcelList.reduce((sum: number, p) => sum + (p.rider_earning || 0), 0);

  // Loading and empty state
  if (isLoading)
    return (
      <div className="space-y-6 pb-12">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" />
      </div>
    );

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* Top Banner Stat */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl">
            <FiCheckCircle />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
              Completed Delivery Missions
            </h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              {parcels.length} Total Fulfilled Orders
            </p>
          </div>
        </div>
        <div className="text-left md:text-right bg-emerald-50/50 dark:bg-emerald-950/30 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
            Accrued Earnings
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ৳{totalEarnings.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  #
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Parcel Name
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Tracking ID
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Cost
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Earning
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Timeline
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Cashout Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {parcelList.map((parcel, idx: number) => (
                <tr
                  key={parcel._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-8 py-6 text-xs font-bold text-slate-400 dark:text-slate-500">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                        <FiPackage size={16} />
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {parcel.parcelName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {parcel.trackingId}
                  </td>
                  <td className="px-6 py-6 text-sm font-black text-[#1E5AA8] dark:text-blue-400">
                    ৳{parcel.cost}
                  </td>
                  <td className="px-6 py-6 text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ৳{(parcel.rider_earning || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Delivered:{' '}
                      {parcel.delivered_at
                        ? moment(parcel.delivered_at).format('MMM D, h:mm A')
                        : 'N/A'}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                      Picked:{' '}
                      {parcel.picked_at ? moment(parcel.picked_at).format('MMM D, h:mm A') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {Array.isArray(cashedOut) && cashedOut.includes(parcel._id) ? (
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 text-[10px] font-black rounded-full uppercase tracking-widest inline-flex items-center gap-1">
                        <FiCheckCircle /> Cashed Out
                      </span>
                    ) : (
                      <button
                        onClick={() => cashoutMutation.mutate(parcel._id)}
                        className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                        disabled={cashoutMutation.isPending}
                      >
                        {cashoutMutation.isPending ? 'Processing...' : 'Cash Out'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {parcelList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                      <FiCalendar size={32} />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold italic">
                      No completed deliveries found.
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

export default CompletedDeliveries;
