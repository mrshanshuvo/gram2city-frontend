'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosSecure } from '@/api/axios';
import { usePageHeader } from '@/hooks/usePageHeader';
import { FiUsers, FiSearch, FiLock, FiUnlock, FiMail, FiCalendar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import moment from 'moment';

interface CustomerRecord {
  _id: string;
  displayName?: string;
  name?: string;
  email: string;
  photoURL?: string;
  role: string;
  status?: string;
  createdAt?: string;
  last_login?: string;
}

export default function AllCustomersPage() {
  usePageHeader('Customer Directory', 'View and manage all customer accounts on the platform');

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const size = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['all-customers', searchTerm, page],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/admin/users?search=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`,
      );
      return res.data;
    },
  });

  const { mutate: mutateStatus } = useMutation({
    mutationFn: async ({ email, status }: { email: string; status: string }) => {
      await axiosSecure.patch(`/admin/users/${encodeURIComponent(email)}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-customers'] });
      Swal.fire('Updated!', 'Customer account status has been changed.', 'success');
    },
    onError: () => {
      Swal.fire('Error', 'Failed to update user status.', 'error');
    },
  });

  const customers: CustomerRecord[] = data?.users || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-8 pb-20 font-urbanist">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl">
            <FiUsers />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total Registered Customers
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalItems}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl">
            <FiUsers />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Page View
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
              Page {page} of {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative group">
        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl group-focus-within:text-[#1E5AA8] transition-colors" />
        <input
          type="text"
          placeholder="Search customer by email..."
          className="input w-full pl-16 h-16 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            Customer Directory ({totalItems})
          </h3>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-bold animate-pulse">
            Loading customers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-none">
                  <th className="px-8 py-4">Customer Identity</th>
                  <th>Contact Email</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th className="text-right px-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {customers.map((c) => (
                  <tr
                    key={c._id || c.email}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-8 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {c.displayName || c.name || 'Customer'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-mono">
                        <FiMail /> {c.email}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          c.status === 'suspended'
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                        }`}
                      >
                        {c.status === 'suspended' ? <FiLock /> : <FiUnlock />}
                        {c.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                        <FiCalendar />{' '}
                        {c.last_login ? moment(c.last_login).fromNow() : 'Registered user'}
                      </div>
                    </td>
                    <td className="text-right px-8">
                      <button
                        onClick={() => {
                          const newStatus = c.status === 'suspended' ? 'active' : 'suspended';
                          Swal.fire({
                            title: `${newStatus === 'suspended' ? 'Suspend' : 'Activate'} Customer?`,
                            text: `This will ${newStatus === 'suspended' ? 'block' : 'restore'} access for ${c.email}.`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: `Yes, ${newStatus}`,
                          }).then((res) => {
                            if (res.isConfirmed) {
                              mutateStatus({ email: c.email, status: newStatus });
                            }
                          });
                        }}
                        className={`btn btn-xs border-none font-black uppercase tracking-tight rounded-lg cursor-pointer ${
                          c.status === 'suspended'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                            : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900'
                        }`}
                      >
                        {c.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {customers.length === 0 && (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 italic font-bold">
                No customers found.
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn btn-sm btn-ghost font-bold text-xs text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              ← Previous
            </button>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-sm btn-ghost font-bold text-xs text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
