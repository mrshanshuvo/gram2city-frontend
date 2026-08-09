'use client';

import { useRouter } from 'next/navigation';

import moment from 'moment';
import Swal from 'sweetalert2';
import {
  FiEye,
  FiDollarSign,
  FiTrash2,
  FiPackage,
  FiFileText,
  FiEdit,
  FiStar,
} from 'react-icons/fi';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import ReviewModal from './ReviewModal';
import { useState } from 'react';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { Parcel } from '@/features/parcels/types';
import { fetchUserParcels, deleteParcel } from '@/features/parcels/api';
import { queryKeys } from '@/lib/queryKeys';
import { usePageHeader } from '@/hooks/usePageHeader';

const MyParcels = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'costHigh' | 'costLow'>('newest');
  const router = useRouter();
  const queryClient = useQueryClient();

  usePageHeader('My Shipments', 'Manage and track your booked parcels');

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Using real data fetching for better skeleton demonstration
  const { data: parcelsData = [], isLoading } = useQuery<Parcel[]>({
    queryKey: queryKeys.parcels.list(user?.email || undefined),
    queryFn: () => {
      if (!user?.email) return [];
      return fetchUserParcels(user.email);
    },
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex justify-between items-center mb-4">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <SkeletonLoader type="table" rows={10} />
      </div>
    );
  }

  // Filter parcels based on search and status
  const filteredParcels = parcelsData
    .filter((parcel: Parcel) => {
      const matchesSearch =
        (parcel.parcelName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (parcel.parcelType || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (parcel.trackingId || '').toLowerCase().includes((searchTerm || '').toLowerCase());

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'paid' && parcel.payment_status === 'paid') ||
        (filterStatus === 'unpaid' && parcel.payment_status !== 'paid') ||
        filterStatus === parcel.delivery_status;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.creation_date || 0).getTime() - new Date(a.creation_date || 0).getTime();
      if (sortBy === 'oldest')
        return new Date(a.creation_date || 0).getTime() - new Date(b.creation_date || 0).getTime();
      if (sortBy === 'costHigh') return (b.cost || 0) - (a.cost || 0);
      if (sortBy === 'costLow') return (a.cost || 0) - (b.cost || 0);
      return 0;
    });

  const handlePay = (parcelId: string) => {
    router.push(`/dashboard/payment/${parcelId}`);
  };

  const handleDelete = async (parcelId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this deletion!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteParcel(parcelId);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.parcels.list(user?.email || undefined),
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your parcel has been deleted.',
          icon: 'success',
        });
      } catch (error: unknown) {
        Swal.fire({
          title: 'Error!',
          text:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to delete the parcel',
          icon: 'error',
        });
      }
    }
  };

  if (filteredParcels.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm font-outfit">
        <div className="max-w-md mx-auto">
          <FiPackage className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-lg font-black text-slate-800 dark:text-slate-100">
            {parcelsData.length === 0 ? 'No parcels yet' : 'No matching parcels found'}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
            {parcelsData.length === 0
              ? 'Get started by creating a new parcel shipment.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-outfit">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <input
          type="text"
          placeholder="Search by package name or tracking ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900">
              All Payment & Status
            </option>
            <option value="paid" className="bg-white dark:bg-slate-900">
              Paid
            </option>
            <option value="unpaid" className="bg-white dark:bg-slate-900">
              Unpaid
            </option>
            <option value="not_collected" className="bg-white dark:bg-slate-900">
              Not Collected
            </option>
            <option value="on_the_way" className="bg-white dark:bg-slate-900">
              On the Way
            </option>
            <option value="delivered" className="bg-white dark:bg-slate-900">
              Delivered
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'newest' | 'oldest' | 'costHigh' | 'costLow')
            }
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-white dark:bg-slate-900">
              Sort: Newest First
            </option>
            <option value="oldest" className="bg-white dark:bg-slate-900">
              Sort: Oldest First
            </option>
            <option value="costHigh" className="bg-white dark:bg-slate-900">
              Cost: High to Low
            </option>
            <option value="costLow" className="bg-white dark:bg-slate-900">
              Cost: Low to High
            </option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest"
                >
                  Package Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest"
                >
                  Timeline
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest"
                >
                  Costing
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest"
                >
                  Payment
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest"
                >
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredParcels.map((parcel: Parcel, index: number) => (
                <tr
                  key={parcel._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-slate-400 dark:text-slate-500">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                          parcel.parcelType === 'Document'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300'
                        }`}
                      >
                        {parcel.parcelType === 'Document' ? (
                          <FiFileText size={18} />
                        ) : (
                          <FiPackage size={18} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                          {parcel.parcelName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                          {parcel.parcelType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {moment(parcel.creation_date).format('MMM D, YYYY')}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {moment(parcel.creation_date).format('h:mm A')}
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-sm font-black text-[#1E5AA8] dark:text-blue-400">
                      ৳{parcel.cost}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Total Fee
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        parcel.payment_status === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40'
                      }`}
                    >
                      {parcel.payment_status === 'paid' ? '● Paid' : '○ Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        parcel.delivery_status === 'not_collected'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          : parcel.delivery_status === 'on_the_way'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40'
                            : parcel.delivery_status === 'delivered'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40'
                              : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40'
                      }`}
                    >
                      {parcel.delivery_status}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/parcels/${parcel._id}`)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>

                      {parcel.delivery_status === 'not_collected' && (
                        <button
                          onClick={() => router.push(`/dashboard/editParcel/${parcel._id}`)}
                          className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-xl transition-all cursor-pointer"
                          title="Edit Shipment"
                        >
                          <FiEdit size={18} />
                        </button>
                      )}

                      {parcel.payment_status !== 'paid' && (
                        <button
                          onClick={() => handlePay(parcel._id)}
                          className="p-2.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-xl transition-all cursor-pointer"
                          title="Pay Now"
                        >
                          <FiDollarSign size={18} />
                        </button>
                      )}

                      {parcel.delivery_status === 'delivered' && (
                        <button
                          onClick={() => {
                            setSelectedParcel(parcel);
                            setShowReviewModal(true);
                          }}
                          className="p-2.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-500 dark:text-amber-300 rounded-xl transition-all cursor-pointer"
                          title="Review Rider"
                        >
                          <FiStar size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(parcel._id)}
                        className="p-2.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-500 dark:text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Cancel Shipment"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReviewModal && selectedParcel && (
        <ReviewModal
          parcel={selectedParcel}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() =>
            queryClient.invalidateQueries({
              queryKey: queryKeys.parcels.list(user?.email || undefined),
            })
          }
        />
      )}
    </div>
  );
};

export default MyParcels;
