'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Truck, PackageCheck, Timer, Send, Loader2, AlertTriangle } from 'lucide-react';
import { axiosSecure } from '@/api/axios';
import { useQuery } from '@tanstack/react-query';
import { StatusItem } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  not_collected: <Timer className="w-6 h-6 text-yellow-500" />,
  on_the_way: <Truck className="w-6 h-6 text-blue-500" />,
  assigned: <Send className="w-6 h-6 text-purple-500" />,
  delivered: <PackageCheck className="w-6 h-6 text-green-500" />,
};

const labelMap: Record<string, string> = {
  not_collected: 'Not Collected',
  on_the_way: 'On the Way',
  assigned: 'Assigned',
  delivered: 'Delivered',
};

const colorMap: Record<string, string> = {
  not_collected: '#FACC15', // yellow
  on_the_way: '#3B82F6', // blue
  assigned: '#8B5CF6', // purple
  delivered: '#22C55E', // green
};

const bgMap: Record<string, string> = {
  not_collected: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40',
  on_the_way: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40',
  assigned: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40',
  delivered: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40',
};

const ParcelStatusSummary = () => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<StatusItem[]>({
    queryKey: ['statusSummary'],
    queryFn: async () => {
      const res = await axiosSecure.get('/parcels/delivery/status-count');
      return res.data;
    },
  });

  const totalParcels = data.reduce((sum: number, item: StatusItem) => sum + item.count, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin w-6 h-6 text-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-rose-500">
        <AlertTriangle className="w-6 h-6 mr-2" /> Failed to load status data.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-outfit">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Parcel Status Dashboard
        </h2>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
          Overview of {totalParcels} total parcels
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(({ status, count }: StatusItem) => (
          <div
            key={status}
            className={`rounded-3xl shadow-sm border ${bgMap[status] || 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'} p-6 flex items-center space-x-4 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="shrink-0">
              {iconMap[status] || <AlertTriangle className="w-6 h-6 text-slate-400" />}
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{count}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {labelMap[status] || status}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                {((count / totalParcels) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4">
          Parcel Distribution
        </h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }: { name?: string | number; percent?: number }) =>
                  `${name ? labelMap[name as string] || name : ''}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry: StatusItem, index: number) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.status] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '1rem',
                  color: '#f8fafc',
                }}
                formatter={(value: number | string, name: string) => [
                  value,
                  labelMap[name] || name,
                ]}
              />
              <Legend formatter={(value: string) => labelMap[value] || value} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ParcelStatusSummary;
