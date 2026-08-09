'use client';

import Link from 'next/link';

import { FiPackage, FiDollarSign, FiClock, FiPlus, FiSearch, FiTrendingUp } from 'react-icons/fi';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import moment from 'moment';
import ProfileCompletionTracker from '@/components/Dashboard/ProfileCompletionTracker';
import { Parcel } from '@/features/parcels/types';
import { useAuthStore } from '@/features/auth/authStore';
import { useQuery } from '@tanstack/react-query';
import { fetchUserByEmail, fetchUserStats } from '@/features/users/api';
import { fetchUserParcels } from '@/features/parcels/api';

const UserDashboard = () => {
  const { user } = useAuthStore();

  const { data: parcelsData = [] } = useQuery<Parcel[]>({
    queryKey: ['user-parcels', user?.email],
    queryFn: () => {
      if (!user?.email) return [];
      return fetchUserParcels(user.email);
    },
    enabled: !!user?.email,
  });

  const { data: dbUser, isLoading: userLoading } = useQuery({
    queryKey: ['db-user', user?.email],
    queryFn: () => {
      if (!user?.email) return null;
      return fetchUserByEmail(user.email);
    },
    enabled: !!user?.email,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats', user?.email],
    queryFn: () => {
      if (!user?.email) return null;
      return fetchUserStats(user.email);
    },
    enabled: !!user?.email,
  });

  if (statsLoading || userLoading) {
    return (
      <div className="space-y-8">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" rows={3} />
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Booked',
      value: stats?.totalBooked || 0,
      icon: <FiPackage />,
      color: 'text-[#2E7D32]',
      bg: 'bg-primary/10',
    },
    {
      label: 'Unpaid Parcels',
      value: stats?.unpaidCount || 0,
      icon: <FiClock />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Spent',
      value: `৳${stats?.totalSpent || 0}`,
      icon: <FiDollarSign />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-end pt-2">
        <Link
          href="/addParcel"
          className="btn bg-primary hover:bg-secondary text-white border-none rounded-2xl font-black px-6 shadow-xl shadow-[#2E7D32]/20 flex items-center gap-2"
        >
          <FiPlus /> New Parcel
        </Link>
      </div>

      {/* Profile Completion Tracker */}
      <ProfileCompletionTracker user={dbUser} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-2xl ${card.bg} ${card.color} text-2xl group-hover:scale-110 transition-transform`}
              >
                {card.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {card.label}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FiTrendingUp className="text-[#2E7D32]" /> Recent Bookings
            </h3>
            <Link
              href="/dashboard/myParcels"
              className="text-sm font-bold text-[#2E7D32] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    Tracking ID
                  </th>
                  <th className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    Parcel Name
                  </th>
                  <th className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    Status
                  </th>
                  <th className="text-[10px] uppercase tracking-wider text-slate-400 font-black text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parcelsData.slice(0, 5).map((parcel: Parcel) => (
                  <tr
                    key={parcel._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="font-mono text-xs font-bold text-[#2E7D32]">
                      {parcel.trackingId}
                    </td>
                    <td className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {parcel.parcelName}
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm border-none font-black text-[10px] uppercase py-3 ${
                          parcel.delivery_status === 'delivered'
                            ? 'bg-primary/10 text-[#2E7D32]'
                            : parcel.delivery_status === 'on_the_way'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {parcel.delivery_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 font-bold text-right">
                      {moment(parcel.creation_date).format('MMM D, YYYY')}
                    </td>
                  </tr>
                ))}
                {parcelsData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 italic font-medium">
                      No bookings yet. Start shipping today!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links / Help */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-[#2E7D32] to-[#1E5AA8] rounded-2xl p-8 text-white shadow-xl shadow-[#2E7D32]/20 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
            <h3 className="text-xl font-black mb-4">Track Instantly</h3>
            <p className="text-white/80 text-sm mb-6 font-medium leading-relaxed">
              Have a tracking number? Check your parcel's real-time location.
            </p>
            <Link
              href="/dashboard/trackParcel"
              className="btn btn-sm bg-white border-none text-[#2E7D32] font-black px-6 hover:bg-slate-50 h-10 rounded-2xl"
            >
              Open Tracker
            </Link>
          </div>

          {/* New: Merchant Promo Card */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none border border-slate-800 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2E7D32] dark:text-emerald-400 mb-4 block">
                Business Growth
              </span>
              <h3 className="text-xl font-black mb-3">Become a Merchant</h3>
              <p className="text-slate-400 dark:text-slate-400 text-sm mb-6 font-medium leading-relaxed">
                Unlock bulk shipping, lower rates, and cash-on-delivery tracking.
              </p>
              <Link
                href="/dashboard/applyMerchant"
                className="btn w-full h-11 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-primary hover:text-white transition-all shadow-lg flex items-center justify-center cursor-pointer"
              >
                APPLY FOR B2B ACCOUNT
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h4 className="font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
              <FiSearch className="text-[#2E7D32] dark:text-emerald-400" /> Live Mission Updates
            </h4>
            <div className="space-y-6 max-h-75 overflow-y-auto pr-2">
              {parcelsData.slice(0, 3).map((parcel: Parcel) => (
                <div key={parcel._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 animate-pulse"></div>
                    <div className="flex-1 w-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#2E7D32] dark:text-emerald-400 uppercase">
                      #{parcel.trackingId}
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                      Currently {parcel.delivery_status.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {moment(parcel.creation_date).fromNow()}
                    </p>
                  </div>
                </div>
              ))}
              {parcelsData.length === 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  No active missions found.
                </p>
              )}
            </div>
          </div>

          {/* Help Links */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h4 className="font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
              <FiSearch className="text-[#2E7D32] dark:text-emerald-400" /> Support Resources
            </h4>
            <div className="space-y-3">
              <Link
                href="/coverage"
                className="block text-sm text-slate-600 dark:text-slate-400 font-bold hover:text-[#2E7D32] dark:hover:text-emerald-400 hover:translate-x-1 transition-all"
              >
                Check Service Area
              </Link>
              <Link
                href="/faqs"
                className="block text-sm text-slate-600 dark:text-slate-400 font-bold hover:text-[#2E7D32] dark:hover:text-emerald-400 hover:translate-x-1 transition-all"
              >
                Shipping Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
