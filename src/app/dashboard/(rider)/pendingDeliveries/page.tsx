'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
// Removed useAuthStore import
import { Parcel } from '@/features/parcels/types';
import {
  fetchAssignedParcels,
  markParcelAsPicked,
  markParcelAsDelivered,
} from '@/features/parcels/api';
import { useSocketStore } from '@/store/useSocketStore';
import {
  FiPackage,
  FiMapPin,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiNavigation,
  FiUser,
  FiTruck,
  FiDollarSign,
} from 'react-icons/fi';
import moment from 'moment';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { usePageHeader } from '@/hooks/usePageHeader';

const PendingDeliveries: React.FC = () => {
  const queryClient = useQueryClient();
  usePageHeader('Active Delivery Tasks', "Your current missions for today's shift");

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch assigned parcels
  const { data: parcels = [], isLoading } = useQuery<Parcel[]>({
    queryKey: ['riderParcels'],
    queryFn: () => fetchAssignedParcels(),
  });

  const pendingParcels = parcels.filter(
    (parcel) => parcel.delivery_status !== 'delivered' && parcel.delivery_status !== 'cancelled',
  );

  // Pick Mutation
  const pickMutation = useMutation({
    mutationFn: (id: string) => markParcelAsPicked(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riderParcels'] });
      toast.success('Mission Started! Parcel Picked Up.', { icon: '🏍️' });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Pickup failed');
    },
  });

  // Deliver Mutation
  const deliverMutation = useMutation({
    mutationFn: (id: string) => markParcelAsDelivered(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riderParcels'] });
      setIsModalOpen(false);
      setSelectedParcel(null);
      toast.success('Mission Accomplished! Parcel Delivered.', { icon: '✅' });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Delivery failed');
    },
  });

  // Real-time GPS stream for active deliveries
  const { socket } = useSocketStore();

  useEffect(() => {
    const activeParcel = pendingParcels.find((p) => p.delivery_status === 'on_the_way');

    if (activeParcel && socket && typeof window !== 'undefined' && navigator.geolocation) {
      console.log(
        `🏍️ Active delivery journey started for: ${activeParcel.trackingId}. Activating GPS stream...`,
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData = {
            trackingId: activeParcel.trackingId,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          };
          socket.emit('rider_location_update', locationData);
          console.log('📍 Sent rider location update:', locationData);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        console.log('📴 Deactivated GPS stream.');
      };
    }
  }, [pendingParcels, socket]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {pendingParcels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
            <FiNavigation size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
            No Active Missions
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
            Enjoy your break! New delivery tasks will appear here once assigned by dispatch.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {pendingParcels.map((parcel) => (
            <div
              key={parcel._id}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="p-8 flex flex-col md:flex-row gap-8">
                {/* Left Side: Parcel Info & Status */}
                <div className="md:w-1/3 border-r border-slate-100 dark:border-slate-800 pr-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                        parcel.delivery_status === 'on_the_way'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      }`}
                    >
                      {parcel.delivery_status === 'on_the_way' ? <FiTruck /> : <FiPackage />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {parcel.parcelName}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        ID: {parcel.trackingId}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                      <FiClock className="text-slate-300 dark:text-slate-600" />
                      <span>Ordered {moment(parcel.creation_date).fromNow()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-black text-[#1E5AA8]">
                      <FiDollarSign className="text-slate-300 dark:text-slate-600" />
                      <span>COD: ৳{parcel.codAmount || 0}</span>
                    </div>
                    <div
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        parcel.delivery_status === 'on_the_way'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {parcel.delivery_status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Right Side: Address & Contacts */}
                <div className="flex-1 grid md:grid-cols-2 gap-8">
                  {/* Pickup */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FiMapPin /> Pickup Point
                    </h4>
                    <div className="space-y-2">
                      <div className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FiUser className="text-slate-300 dark:text-slate-600" />{' '}
                        {parcel.senderName}
                      </div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <FiPhone className="text-slate-300 dark:text-slate-600" />{' '}
                        {parcel.senderContact}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-2">
                        {parcel.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-50 dark:border-emerald-900/30">
                    <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FiNavigation /> Destination
                    </h4>
                    <div className="space-y-2">
                      <div className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FiUser className="text-emerald-500 dark:text-emerald-400" />{' '}
                        {parcel.receiverName}
                      </div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <FiPhone className="text-emerald-500 dark:text-emerald-400" />{' '}
                        {parcel.receiverPhoneNumber}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-2">
                        {parcel.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 border-t border-slate-50 dark:border-slate-800 flex justify-end gap-4">
                {parcel.delivery_status === 'assigned' && (
                  <button
                    onClick={() => pickMutation.mutate(parcel._id)}
                    disabled={pickMutation.isPending}
                    className="btn btn-sm bg-secondary hover:bg-primary text-white border-none rounded-xl px-8 font-black uppercase tracking-widest shadow-lg shadow-secondary/20 h-11 cursor-pointer"
                  >
                    {pickMutation.isPending ? 'Starting Mission...' : 'Mark as Picked'}
                  </button>
                )}
                {parcel.delivery_status === 'on_the_way' && (
                  <button
                    onClick={() => {
                      setSelectedParcel(parcel);
                      setIsModalOpen(true);
                    }}
                    className="btn btn-sm bg-primary hover:bg-secondary text-white border-none rounded-xl px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-11 cursor-pointer"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Confirmation Modal */}
      {isModalOpen && selectedParcel && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-100 animate-in fade-in duration-300 font-outfit">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-emerald-100 dark:border-emerald-900/40">
              <FiCheckCircle />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 text-center mb-2 tracking-tight">
              Confirm Delivery?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-center mb-8 text-sm">
              Are you sure you have successfully delivered the parcel to{' '}
              <span className="text-slate-800 dark:text-slate-100 font-black">
                {selectedParcel.receiverName}
              </span>
              ?
            </p>

            <div className="flex flex-col gap-3">
              <button
                className="btn btn-lg bg-primary hover:bg-secondary text-white border-none rounded-2xl font-black uppercase tracking-widest h-16 shadow-xl shadow-primary/20 cursor-pointer"
                onClick={() => deliverMutation.mutate(selectedParcel._id)}
                disabled={deliverMutation.isPending}
              >
                {deliverMutation.isPending ? 'Processing...' : 'Yes, Delivered'}
              </button>
              <button
                className="btn btn-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 border-none rounded-2xl font-black uppercase tracking-widest h-16 cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDeliveries;
