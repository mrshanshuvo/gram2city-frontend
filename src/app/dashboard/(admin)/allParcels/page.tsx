'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchAllParcels } from '@/features/admin/api';
import {
  FiCalendar,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiEye,
} from 'react-icons/fi';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import moment from 'moment';
import { Parcel } from '@/features/parcels/types';
import { useRouter } from 'next/navigation';

const AllParcels = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery<{
    data: Parcel[];
    pagination: {
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>({
    queryKey: ['admin-all-parcels', page, size, status, startDate, endDate],
    queryFn: () => fetchAllParcels({ page, size, status, startDate, endDate }),
  });

  const parcels = data?.data || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const totalPages = pagination.totalPages;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startRange = (page - 1) * size + 1;
  const endRange = Math.min(page * size, pagination.totalItems);

  const downloadCSV = () => {
    if (parcels.length === 0) return;

    const headers = ['Tracking ID', 'Parcel Name', 'Receiver', 'Phone', 'Status', 'Cost', 'Date'];
    const rows = parcels.map((p) => [
      p.trackingId,
      p.parcelName,
      p.receiverName,
      p.receiverContact, // Receiver Phone maps to receiverContact in ParcelFormData
      p.delivery_status,
      p.total_cost || p.cost,
      moment(p.creation_date || p.createdAt).format('YYYY-MM-DD'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gram2city_report_${moment().format('YYYYMMDD_HHmm')}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 font-outfit">
            All Parcels
          </h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium font-outfit">
            Track and monitor every shipment on the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="btn btn-sm bg-primary text-white border-none hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 rounded-xl font-bold"
          >
            Download Report
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 h-10">
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Rows:</span>
            <select
              className="select select-ghost select-xs focus:bg-transparent outline-none border-none text-gray-700 dark:text-slate-200 font-bold bg-transparent"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option
                value={10}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                10
              </option>
              <option
                value={25}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                25
              </option>
              <option
                value={50}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                50
              </option>
              <option
                value={100}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                100
              </option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-gray-50 dark:border-slate-800">
            <button className="btn btn-sm btn-ghost btn-square text-primary">
              <FiList />
            </button>
            <button className="btn btn-sm btn-ghost btn-square text-gray-300 dark:text-slate-600">
              <FiGrid />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="form-control">
          <label className="label text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-0">
            Filter by Status
          </label>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="select select-bordered w-full pl-10 h-10 min-h-0 bg-gray-50 dark:bg-slate-800/80 border-none font-bold text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="on_the_way">On the Way</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-0">
            Start Date
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="date"
              className="input w-full pl-10 h-10 min-h-0 bg-gray-50 dark:bg-slate-800/80 border-none font-bold text-xs text-slate-800 dark:text-slate-200"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-0">
            End Date
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="date"
              className="input w-full pl-10 h-10 min-h-0 bg-gray-50 dark:bg-slate-800/80 border-none font-bold text-xs text-slate-800 dark:text-slate-200"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setStatus('all');
              setPage(1);
            }}
            className="btn btn-ghost w-full h-10 min-h-0 text-xs font-bold text-gray-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" rows={size} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full text-xs">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                <tr className="border-b border-gray-100 dark:border-slate-800">
                  <th className="font-outfit uppercase tracking-wider text-gray-400 dark:text-slate-400 font-bold py-5">
                    Customer
                  </th>
                  <th className="font-outfit uppercase tracking-wider text-gray-400 dark:text-slate-400 font-bold py-5">
                    Parcel Details
                  </th>
                  <th className="font-outfit uppercase tracking-wider text-gray-400 dark:text-slate-400 font-bold py-5">
                    Assigned Rider
                  </th>
                  <th className="font-outfit uppercase tracking-wider text-gray-400 dark:text-slate-400 font-bold py-5">
                    Value
                  </th>
                  <th className="font-outfit uppercase tracking-wider text-gray-400 dark:text-slate-400 font-bold py-5">
                    Status
                  </th>
                  <th className="font-outfit uppercase tracking-wider text-gray-400 dark:text-slate-400 font-bold py-5 text-right">
                    Date
                  </th>
                  <th className="font-outfit uppercase tracking-wider text-gray-400 dark:text-slate-400 font-bold py-5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {parcels.map((parcel) => (
                  <tr
                    key={parcel._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-gray-800 dark:text-slate-100 text-sm tracking-tight">
                          {parcel.senderName}
                        </span>

                        <span className="text-[10px] text-gray-400 dark:text-slate-500">
                          {parcel.senderContact}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-primary font-bold">
                          #{parcel.trackingId}
                        </span>
                        <span className="text-gray-500 dark:text-slate-400 font-medium">
                          {parcel.parcelType} ({parcel.requiredVehicle || 'bike'})
                        </span>
                      </div>
                    </td>
                    <td>
                      {parcel.assigned_rider_name ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-tighter">
                            {parcel.assigned_rider_name}
                          </span>
                          <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold">
                            {parcel.assigned_rider_phone || 'No Phone'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 italic uppercase">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-700 dark:text-slate-200">
                          ৳{parcel.cost}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">
                          COD: ৳{parcel.codAmount || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm border-none font-bold uppercase text-[9px] tracking-widest px-3 py-2 ${
                          parcel.delivery_status === 'delivered'
                            ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                            : parcel.delivery_status === 'assigned'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : parcel.delivery_status === 'collected'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {parcel.delivery_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="text-gray-400 dark:text-slate-400 font-medium">
                        {moment(parcel.creation_date).format('MMM D, YYYY')}
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => router.push(`/dashboard/parcels/${parcel._id}`)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Improved Pagination Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 gap-4">
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Showing <span className="text-gray-800 dark:text-slate-200">{startRange}</span> to{' '}
              <span className="text-gray-800 dark:text-slate-200">{endRange}</span> of{' '}
              <span className="text-gray-800 dark:text-slate-200">{pagination.totalItems}</span>{' '}
              parcels
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm bg-white dark:bg-slate-800 border-none shadow-sm hover:bg-primary hover:text-white transition-all text-gray-400 dark:text-slate-400 cursor-pointer disabled:opacity-40"
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <FiChevronLeft />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Smart Pagination: Show first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`btn btn-sm w-9 h-9 min-h-0 border-none shadow-sm transition-all cursor-pointer ${
                          page === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span
                        key={pageNum}
                        className="text-gray-300 dark:text-slate-600 font-bold px-1"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                className="btn btn-sm bg-white dark:bg-slate-800 border-none shadow-sm hover:bg-primary hover:text-white transition-all text-gray-400 dark:text-slate-400 cursor-pointer disabled:opacity-40"
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNextPage}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllParcels;
