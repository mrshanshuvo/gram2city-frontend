'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllMerchants, updateMerchantStatus } from '@/features/admin/api';
import { Merchant } from '@/features/admin/types';
import { toast } from 'sonner';
import { FiInfo, FiBriefcase, FiMail, FiMapPin } from 'react-icons/fi';
import { usePageHeader } from '@/hooks/usePageHeader';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';

const ManageMerchants = () => {
  const queryClient = useQueryClient();
  usePageHeader('Merchant Management', 'Verify and manage business partners');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-merchants'],
    queryFn: fetchAllMerchants,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateMerchantStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
      toast.success('Merchant status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update merchant status');
    },
  });

  if (isLoading) {
    return <SkeletonLoader type="table" rows={5} />;
  }

  const merchants: Merchant[] = data?.merchants || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400">
                  Business Profile
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400">
                  Legal Info
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400">
                  Status
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-right text-gray-400 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {merchants.map((merchant) => (
                <tr
                  key={merchant._id}
                  className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-all"
                >
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-inner">
                        <FiBriefcase />
                      </div>
                      <div>
                        <div className="font-black text-gray-800 dark:text-slate-100">
                          {merchant.businessName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-400 font-bold mt-0.5">
                          <FiMail size={12} /> {merchant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="space-y-1">
                      <div className="text-xs font-black text-gray-500 dark:text-slate-300 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[9px] uppercase">
                          ID
                        </span>
                        {merchant.tradeLicense}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 flex items-center gap-2">
                        <FiMapPin size={10} /> {merchant.address}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        merchant.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : merchant.status === 'rejected'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {merchant.status}
                    </span>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex justify-end gap-2">
                      {merchant.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              mutation.mutate({
                                id: merchant._id,
                                status: 'approved',
                              })
                            }
                            className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 border-none text-white font-black rounded-lg px-4 cursor-pointer"
                            disabled={mutation.isPending}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              mutation.mutate({
                                id: merchant._id,
                                status: 'rejected',
                              })
                            }
                            className="btn btn-xs bg-red-500 hover:bg-red-600 border-none text-white font-black rounded-lg px-4 cursor-pointer"
                            disabled={mutation.isPending}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button className="btn btn-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border-none text-gray-600 dark:text-slate-300 font-black rounded-lg px-2 cursor-pointer">
                        <FiInfo />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {merchants.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-gray-400 dark:text-slate-500 font-bold italic"
                  >
                    No merchant applications found.
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

export default ManageMerchants;
