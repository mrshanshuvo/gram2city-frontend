'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosSecure } from '@/api/axios';
import { fetchAdminStats } from '@/features/admin/api';
import { AdminStats } from '@/features/admin/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FiTrendingUp,
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiAward,
  FiStar,
  FiZap,
} from 'react-icons/fi';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import moment from 'moment';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

import { LogActivity } from '@/types';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => fetchAdminStats(),
  });

  const { data: recentActivity = [] } = useQuery<LogActivity[]>({
    queryKey: ['admin-recent-tracking'],
    queryFn: async () => {
      const res = await axiosSecure.get('/trackings/all/recent');
      return res.data.history;
    },
    refetchInterval: 10000, // Poll every 10 seconds for "live" feel
  });

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="chart" />
      </div>
    );
  }

  const data = stats?.stats;

  const coreCards = [
    {
      label: 'Total Bookings',
      value: data?.parcels?.total || 0,
      icon: <FiPackage />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Revenue',
      value: `৳${data?.revenue?.toLocaleString() || 0}`,
      icon: <FiDollarSign />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Profit',
      value: `৳${data?.profit?.toLocaleString() || 0}`,
      icon: <FiTrendingUp />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Success Rate',
      value: `${data?.parcels?.delivered && data?.parcels?.total ? ((data.parcels.delivered / data.parcels.total) * 100).toFixed(1) : 0}%`,
      icon: <FiTrendingUp />,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];

  const deliveryPipeline = [
    { name: 'Pending', value: data?.parcels?.pending || 0, color: '#F59E0B' },
    {
      name: 'In Transit',
      value: data?.parcels?.onTheWay || 0,
      color: '#6366F1',
    },
    {
      name: 'Delivered',
      value: data?.parcels?.delivered || 0,
      color: '#10B981',
    },
    {
      name: 'Returned/Cancelled',
      value: (data?.parcels?.returned || 0) + (data?.parcels?.cancelled || 0),
      color: '#EF4444',
    },
  ];

  const platformStats = [
    {
      label: 'Total Customers',
      value: data?.users?.customers || 0,
      icon: <FiUsers />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Active Riders',
      value: data?.users?.riders || 0,
      icon: <FiUsers />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Avg Delivery',
      value: `${data?.avgDeliveryTime?.toFixed(1) || 0}h`,
      icon: <FiClock />,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          System Authority
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time Node Active
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {coreCards.map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
          >
            <div
              className={`w-12 h-12 ${card.bg} dark:bg-slate-800 ${card.color} rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}
            >
              {card.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {card.label}
            </p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Analytics & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                Growth Velocity
              </h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Live order ingestion metrics
              </p>
            </div>
            <FiTrendingUp className="text-blue-500 text-2xl" />
          </div>
          <div className="h-75">
            <ResponsiveContainer>
              <BarChart data={data?.dailyBookings || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                  dataKey="_id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                  }}
                />
                <Bar dataKey="count" fill="#1E5AA8" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center animate-pulse">
              <FiZap />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Live Logistics Feed</h3>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 relative z-10">
            {recentActivity.map((log: LogActivity, i: number) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${i === 0 ? 'bg-blue-400 animate-ping' : 'bg-slate-700'}`}
                  ></div>
                  <div className="flex-1 w-px bg-slate-800 my-1"></div>
                </div>
                <div className="pb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">
                    {moment(log.time).fromNow()} • {log.trackingId}
                  </p>
                  <p className="text-xs font-bold text-slate-200 leading-tight group-hover:text-blue-400 transition-colors">
                    {log.details}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-800 text-[9px] font-black rounded-md text-slate-400 uppercase">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>
        </div>
      </div>

      {/* Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 uppercase tracking-tighter">
            Pipeline Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div className="h-62.5">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={deliveryPipeline}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {deliveryPipeline.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {deliveryPipeline.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
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

        {/* Fleet */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 uppercase tracking-tighter">
            Fleet Distribution
          </h3>
          <div className="h-75">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data?.fleetDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                >
                  {data?.fleetDistribution?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name?.toString().toUpperCase()]} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => (
                    <span className="text-[10px] font-black uppercase text-slate-500">{val}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
              Rider Hall of Fame
            </h3>
            <FiAward className="text-amber-500 text-xl" />
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-none">
                  <th className="px-10 py-6">Rider Identity</th>
                  <th>Deliveries</th>
                  <th className="text-right px-10">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data?.riderLeaderboard?.map((rider, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <div className="font-black text-slate-800 dark:text-slate-100 text-sm">
                        {rider.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        {rider.email}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                          {rider.deliveredCount}
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full max-w-25 overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${Math.min(rider.deliveredCount * 5, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-10">
                      <div className="flex items-center justify-end gap-1.5 text-amber-500 font-black">
                        <FiStar fill="currentColor" /> {rider.rating?.toFixed(1) || '5.0'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-10">
            Platform Vitality
          </h3>
          <div className="space-y-10">
            {platformStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-6">
                <div
                  className={`w-14 h-14 ${stat.bg} dark:bg-slate-800 ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                    {stat.value}
                  </h4>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 p-4 rounded-2xl">
              <span>Cloud Status</span>
              <span>Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
