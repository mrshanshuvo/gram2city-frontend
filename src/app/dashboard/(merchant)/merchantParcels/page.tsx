'use client';

import { useRouter } from 'next/navigation';

import {
  FiEye,
  FiPackage,
  FiUser,
  FiUpload,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { Parcel } from '@/features/parcels/types';
import { fetchUserParcels } from '@/features/parcels/api';
import { queryKeys } from '@/lib/queryKeys';
import { usePageHeader } from '@/hooks/usePageHeader';
import { axiosSecure } from '@/api/axios';
import toast from 'react-hot-toast';

const MerchantParcels = () => {
  const { user } = useAuthStore();
  const context = {
    searchTerm: '',
    filterStatus: 'all',
  };
  const { searchTerm, filterStatus } = context;
  const router = useRouter();
  const queryClient = useQueryClient();

  usePageHeader('Merchant Shipments', 'Monitor your business parcel lifecycle and COD collections');

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const { data: parcelsData = [], isLoading } = useQuery<Parcel[]>({
    queryKey: queryKeys.parcels.list(user?.email || undefined),
    queryFn: () => {
      if (!user?.email) return [];
      return fetchUserParcels(user.email);
    },
    enabled: !!user?.email,
  });

  const bulkMutation = useMutation({
    mutationFn: async (parcels: Record<string, string>[]) => {
      const res = await axiosSecure.post('/parcels/bulk', {
        parcels,
        merchantId: user?._id,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parcels.list(user?.email || undefined),
      });
      setIsBulkModalOpen(false);
      setCsvData([]);
      toast.success('Bulk upload successful!', { icon: '🚀' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Bulk upload failed'),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      const data = lines
        .slice(1)
        .filter((l) => l.trim())
        .map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((header, i) => {
            obj[header] = values[i];
          });
          return obj;
        });

      setCsvData(data);
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  const filteredParcels = parcelsData.filter((parcel: Parcel) => {
    const matchesSearch =
      (parcel.parcelName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (parcel.receiverName || '').toLowerCase().includes((searchTerm || '').toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending_cod' && parcel.delivery_status !== 'delivered') ||
      (filterStatus === 'collected' && parcel.delivery_status === 'delivered');

    return matchesSearch && matchesStatus;
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['merchant-stats', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/merchants/stats');
      return res.data.stats;
    },
    enabled: !!user?.email,
  });

  if (isLoading || statsLoading)
    return (
      <div className="space-y-8 pb-12">
        <SkeletonLoader type="table" rows={10} />
      </div>
    );

  const stats = statsData || {
    totalBookings: 0,
    totalCODCollected: 0,
    pendingCOD: 0,
    deliveredCount: 0,
  };

  return (
    <div className="space-y-6 pb-12 font-outfit">
      {/* KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center text-xl">
            <FiPackage />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total Bookings
            </div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100">
              {stats.totalBookings}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-2xl flex items-center justify-center text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Delivered
            </div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100">
              {stats.deliveredCount}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center text-xl">
            <FiUpload />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Pending COD
            </div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100">
              ৳{(stats?.pendingCOD || 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-2xl flex items-center justify-center text-xl">
            <FiEye className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              COD Collected
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ৳{(stats?.totalCODCollected || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="btn btn-sm bg-secondary text-white border-none hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-8 rounded-2xl font-black uppercase tracking-widest h-11 flex items-center gap-2 cursor-pointer"
        >
          <FiUpload /> Bulk CSV Upload
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Parcel & ID
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Destination
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  COD Amount
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800">
              {filteredParcels.map((parcel: Parcel) => (
                <tr
                  key={parcel._id}
                  className="hover:bg-slate-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                        <FiPackage size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                          {parcel.parcelName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                          #{parcel.trackingId || parcel._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <FiUser className="text-slate-300 dark:text-slate-600" />{' '}
                      {parcel.receiverName}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {parcel.receiverContact}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-xs font-black text-slate-600 dark:text-slate-300 truncate max-w-37.5">
                      {parcel.deliveryAddress}
                    </div>
                    <div className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase">
                      {parcel.receiverDistrict}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ৳{parcel.codAmount || 0}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Collection
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        parcel.delivery_status === 'delivered'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
                          : parcel.delivery_status === 'on_the_way'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40'
                      }`}
                    >
                      {parcel.delivery_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => router.push(`/dashboard/parcels/${parcel._id}`)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                    >
                      <FiEye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredParcels.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold italic"
                  >
                    No shipments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl">
                  <FiUpload />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    Bulk Shipment Upload
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
                    Upload your CSV and map fields
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <FiXCircle size={32} />
              </button>
            </div>

            {!csvData.length ? (
              <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-6">
                <FiFileText size={64} className="text-slate-200 dark:text-slate-700" />
                <div>
                  <p className="text-slate-700 dark:text-slate-200 font-black text-lg">
                    Select a CSV file to begin
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">
                    Download our template to ensure correct formatting
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="btn bg-secondary hover:bg-blue-700 text-white border-none rounded-2xl px-10 font-black uppercase h-14 cursor-pointer flex items-center gap-2"
                >
                  {isParsing ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <FiUpload />
                  )}
                  Choose File
                </label>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                  <FiCheckCircle /> {csvData.length} Shipments detected in file
                </div>

                <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="table table-xs w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                      <tr className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400">
                        {Object.keys(csvData[0]).map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {csvData.map((row, i) => (
                        <tr
                          key={i}
                          className="text-[10px] font-bold text-slate-700 dark:text-slate-300"
                        >
                          {Object.values(row).map((v: string, j) => (
                            <td key={j}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => setCsvData([])}
                    className="btn btn-ghost text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest cursor-pointer"
                  >
                    Clear & Restart
                  </button>
                  <button
                    onClick={() => bulkMutation.mutate(csvData)}
                    disabled={bulkMutation.isPending}
                    className="btn bg-primary hover:bg-green-700 text-white border-none rounded-2xl px-12 font-black uppercase tracking-widest h-14 shadow-lg shadow-green-500/20 cursor-pointer"
                  >
                    {bulkMutation.isPending ? 'Processing...' : 'Deploy Shipments'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantParcels;
