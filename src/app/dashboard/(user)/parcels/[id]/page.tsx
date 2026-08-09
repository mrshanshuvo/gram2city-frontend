'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  FiPackage,
  FiMapPin,
  FiUser,
  FiClock,
  FiDollarSign,
  FiArrowLeft,
  FiEdit,
  FiActivity,
  FiCheckCircle,
} from 'react-icons/fi';
import moment from 'moment';
import { fetchParcelById, fetchParcelTracking } from '@/features/parcels/api';
import { queryKeys } from '@/lib/queryKeys';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { usePageHeader } from '@/hooks/usePageHeader';

import { TrackingUpdate } from '@/types';

const ParcelDetails: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  usePageHeader('Shipment Intelligence', 'Detailed overview of your parcel journey');

  const { data: parcel, isLoading: isParcelLoading } = useQuery({
    queryKey: ['parcel', id],
    queryFn: () => fetchParcelById(id!),
    enabled: !!id,
  });

  const { data: trackings = [], isLoading: isTrackingLoading } = useQuery<TrackingUpdate[]>({
    queryKey: queryKeys.parcels.tracking(parcel?.trackingId),
    queryFn: () => fetchParcelTracking(parcel.trackingId),
    enabled: !!parcel?.trackingId,
  });

  if (isParcelLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" rows={5} />
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center font-outfit">
        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-slate-600">
          <FiPackage size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">Parcel Not Found</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">
          The shipment you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/dashboard/myParcels')}
          className="mt-8 btn btn-primary px-8 rounded-2xl font-black cursor-pointer"
        >
          Back to My Shipments
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    not_collected:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-900/40',
    collected:
      'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900/40',
    in_transit:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/40',
    delivered:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40',
    cancelled:
      'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-900/40',
    on_the_way:
      'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-900/40',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-in fade-in duration-500 font-outfit">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="flex gap-2">
          {parcel.delivery_status === 'not_collected' && (
            <button
              onClick={() => router.push(`/dashboard/editParcel/${parcel._id}`)}
              className="btn btn-sm bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border-none rounded-xl px-4 normal-case font-black cursor-pointer"
            >
              <FiEdit className="mr-2" /> Edit Shipment
            </button>
          )}
          {parcel.payment_status === 'unpaid' && (
            <button
              onClick={() => router.push(`/dashboard/payment/${parcel._id}`)}
              className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl px-4 normal-case font-black shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <FiDollarSign className="mr-2" /> Pay Now
            </button>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-10">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  Tracking Identity
                </span>
                <h1 className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tighter font-mono">
                  {parcel.trackingId}
                </h1>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  Current Status
                </span>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${statusColors[parcel.delivery_status] || 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-700'}`}
                >
                  {parcel.delivery_status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-50 dark:bg-slate-800 -translate-x-1/2"></div>

              {/* Sender Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                    <FiMapPin />
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">
                    Pickup Point
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">
                      Sender Name
                    </p>
                    <p className="font-black text-gray-800 dark:text-slate-100">
                      {parcel.senderName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">
                      Contact
                    </p>
                    <p className="font-bold text-gray-600 dark:text-slate-300">
                      {parcel.senderPhone || parcel.senderContact}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">
                      Location
                    </p>
                    <p className="font-bold text-gray-600 dark:text-slate-300 leading-relaxed">
                      {parcel.senderAddress}, {parcel.senderDistrict}, {parcel.senderRegion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
                    <FiUser />
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">
                    Delivery Hub
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">
                      Recipient Name
                    </p>
                    <p className="font-black text-gray-800 dark:text-slate-100">
                      {parcel.receiverName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">
                      Contact
                    </p>
                    <p className="font-bold text-gray-600 dark:text-slate-300">
                      {parcel.receiverPhone || parcel.receiverContact || parcel.receiverPhoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">
                      Destination
                    </p>
                    <p className="font-bold text-gray-600 dark:text-slate-300 leading-relaxed">
                      {parcel.deliveryAddress}, {parcel.receiverDistrict}, {parcel.receiverRegion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-10">
            <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 mb-10 flex items-center gap-3">
              <FiActivity className="text-primary" /> Tracking Timeline
            </h3>

            {isTrackingLoading ? (
              <SkeletonLoader type="table" rows={3} />
            ) : trackings.length > 0 ? (
              <div className="space-y-0">
                {trackings.map((update: TrackingUpdate, idx: number) => (
                  <div key={update._id} className="relative flex gap-8 pb-12 group last:pb-0">
                    {idx !== trackings.length - 1 && (
                      <div className="absolute left-6 top-10 bottom-0 w-1 bg-linear-to-b from-primary/30 to-gray-50 dark:to-slate-800 -translate-x-1/2"></div>
                    )}

                    <div
                      className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${
                        idx === 0
                          ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-slate-600'
                      }`}
                    >
                      {idx === 0 ? <FiActivity className="animate-pulse" /> : <FiCheckCircle />}
                    </div>

                    <div className={`flex-1 pt-1 ${idx === 0 ? 'opacity-100' : 'opacity-60'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-gray-800 dark:text-slate-100 uppercase tracking-tighter text-base">
                            {update.status?.replace('_', ' ')}
                          </h4>
                          <p className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest mt-0.5">
                            {update.location || 'Central Hub'}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                          {moment(update.time).format('MMM DD, HH:mm A')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 italic leading-relaxed">
                        "{update.details}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                <FiClock className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={30} />
                <p className="text-gray-400 dark:text-slate-500 text-sm font-bold">
                  Waiting for first tracking update...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-900/20 relative overflow-hidden group border border-slate-800">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-all duration-1000"></div>

            <span className="text-[10px] font-black text-blue-300 dark:text-blue-400 uppercase tracking-widest block mb-4">
              Financial Summary
            </span>
            <div className="text-5xl font-black tracking-tighter mb-8 flex items-baseline gap-1">
              <span className="text-2xl font-bold opacity-60">৳</span>
              {parcel.cost || parcel.total_cost}
            </div>

            <div className="space-y-6 border-t border-white/10 pt-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-300 dark:text-blue-400 uppercase tracking-widest">
                  Parcel Type
                </span>
                <span className="font-black text-xs uppercase">{parcel.parcelType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-300 dark:text-blue-400 uppercase tracking-widest">
                  Gross Weight
                </span>
                <span className="font-black text-xs uppercase">
                  {parcel.weight || parcel.parcelWeight} KG
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-300 dark:text-blue-400 uppercase tracking-widest">
                  Payment
                </span>
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                    parcel.payment_status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {parcel.payment_status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm p-8 text-center">
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block mb-6">
              Internal ID
            </span>
            <code className="text-xs font-bold text-gray-500 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
              {parcel._id}
            </code>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-6 font-medium">
              Booked on {moment(parcel.creation_date || parcel.createdAt).format('MMMM Do YYYY')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelDetails;
