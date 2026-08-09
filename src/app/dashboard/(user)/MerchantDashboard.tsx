'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import {
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiActivity,
  FiPlus,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuthStore } from '@/features/auth/authStore';
import { fetchUserStats } from '@/features/users/api'; // We'll need a merchant specific one soon
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MerchantDashboard = () => {
  const { user } = useAuthStore();

  // For now using user stats, but in a real app we'd have a merchant-specific API
  const { data: stats, isLoading } = useQuery({
    queryKey: ['merchant-stats', user?.email],
    queryFn: () => {
      if (!user?.email) return null;
      return fetchUserStats(user.email);
    },
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
        <SkeletonLoader type="chart" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Volume',
      value: stats?.totalBooked || 0,
      icon: <FiPackage />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'COD Pending',
      value: `৳${stats?.totalSpent || 0}`, // Placeholder logic
      icon: <FiClock />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Paid to Me',
      value: '৳0',
      icon: <FiDollarSign />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const pipelineData = [
    { name: 'Order Placed', value: 12, color: '#F59E0B' },
    { name: 'In Transit', value: 8, color: '#6366F1' },
    { name: 'Delivered', value: 45, color: '#10B981' },
    { name: 'Returns', value: 3, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Merchant Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">
            Manage your business shipments and receivables
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/addParcel"
            className="btn bg-primary hover:bg-secondary text-white border-none rounded-2xl font-black px-6 shadow-xl shadow-primary/20 flex items-center gap-2 cursor-pointer"
          >
            <FiPlus /> Create Shipment
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-4 rounded-2xl ${kpi.bg} dark:bg-slate-800 ${kpi.color} dark:text-slate-100 text-2xl group-hover:scale-110 transition-transform`}
              >
                {kpi.icon}
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {kpi.label}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logistics Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FiActivity className="text-blue-500" /> Shipment Lifecycle
            </h3>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Real-time update
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '1rem',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {pipelineData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Tips / Announcements */}
        <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-slate-800">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <FiTruck className="text-4xl mb-6 text-white/50" />
          <h3 className="text-xl font-black mb-4">Grow Your Business</h3>
          <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
            Did you know? Merchants using our **Large Pickup** service see 40% faster heavy-goods
            delivery.
          </p>
          <button className="btn btn-sm bg-white border-none text-slate-900 font-black rounded-xl px-6 h-10 hover:bg-slate-100 cursor-pointer">
            Learn More
          </button>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-emerald-600 dark:text-emerald-400 text-3xl shadow-sm">
          <FiCheckCircle />
        </div>
        <div>
          <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300">
            Business Profile Verified
          </h4>
          <p className="text-emerald-700/70 dark:text-emerald-400/80 text-sm font-medium mt-0.5">
            Your trade license has been successfully verified. You now have access to priority
            pickup and lower commissions.
          </p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiActivity className="text-emerald-500" /> Recent B2B Shipments
          </h3>
          <Link
            href="/dashboard/merchantParcels"
            className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline tracking-widest"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800">
                <th className="py-6 px-8">Customer</th>
                <th className="py-6 px-8">COD Amount</th>
                <th className="py-6 px-8">Status</th>
                <th className="py-6 px-8 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                <td className="py-6 px-8">
                  <div className="font-bold text-slate-700 dark:text-slate-200">
                    Digital Solutions Ltd.
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    Order #TX-8821
                  </div>
                </td>
                <td className="py-6 px-8 font-black text-emerald-600 dark:text-emerald-400">
                  ৳4,250
                </td>
                <td className="py-6 px-8">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 text-[10px] font-black rounded-full">
                    IN TRANSIT
                  </span>
                </td>
                <td className="py-6 px-8 text-right text-xs font-bold text-slate-400 dark:text-slate-500">
                  May 12, 2026
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                <td className="py-6 px-8">
                  <div className="font-bold text-slate-700 dark:text-slate-200">Global Traders</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    Order #TX-8819
                  </div>
                </td>
                <td className="py-6 px-8 font-black text-emerald-600 dark:text-emerald-400">
                  ৳1,100
                </td>
                <td className="py-6 px-8">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 text-[10px] font-black rounded-full">
                    DELIVERED
                  </span>
                </td>
                <td className="py-6 px-8 text-right text-xs font-bold text-slate-400 dark:text-slate-500">
                  May 11, 2026
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
