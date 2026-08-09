'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { FiSearch, FiPackage, FiMapPin, FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi';
import moment from 'moment';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { TrackingUpdate } from '@/features/parcels/types';
import { useSocketStore } from '@/store/useSocketStore';
import { queryKeys } from '@/lib/queryKeys';
import { usePageHeader } from '@/hooks/usePageHeader';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { fetchPublicTracking } from '@/features/parcels/api';
import { Suspense } from 'react';
import PageLoader from '@/components/Shared/PageLoader';

const TrackingMap = dynamic(() => import('@/components/TrackParcel/TrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 animate-pulse flex items-center justify-center">
      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
        Loading Map Stream...
      </div>
    </div>
  ),
});

function TrackParcelContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (params?.id as string) || (searchParams?.get('id') as string) || '';
  const [searchId, setSearchId] = useState(id || '');
  const [trackingId, setTrackingId] = useState(id || '');
  const [riderLocation, setRiderLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { socket, connected } = useSocketStore();

  useEffect(() => {
    if (id) {
      setSearchId(id);
      setTrackingId(id);
    }
  }, [id]);

  usePageHeader('Track Your Shipment', 'Real-time logistics intelligence');

  const { data: trackings = [], isLoading } = useQuery<TrackingUpdate[]>({
    queryKey: queryKeys.parcels.tracking(trackingId),
    queryFn: () => {
      if (!trackingId) return [];
      return fetchPublicTracking(trackingId);
    },
    enabled: !!trackingId,
  });

  // Real-time Socket Integration
  useEffect(() => {
    if (socket && trackingId) {
      socket.emit('join_parcel', trackingId);

      socket.on('location_received', (data) => {
        if (data.trackingId === trackingId) {
          console.log('📍 Live Location Received:', data.location);
          setRiderLocation(data.location);
        }
      });

      return () => {
        socket.off('location_received');
      };
    }
  }, [socket, trackingId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setTrackingId(searchId.trim());
      setRiderLocation(null); // Reset for new search
    }
  };

  const currentStatus = trackings[0]?.status;
  const isLive = connected && (currentStatus === 'on_the_way' || currentStatus === 'assigned');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-4 font-outfit">
      <div className="flex flex-col items-center gap-6">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 w-full max-w-md bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-primary/10 border border-gray-100 dark:border-slate-800"
        >
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Ex: G2C-123456"
              className="input w-full border-none focus:ring-0 pl-11 h-12 bg-transparent font-mono font-bold text-primary dark:text-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary h-12 px-8 rounded-xl font-bold uppercase tracking-tight cursor-pointer"
          >
            Track
          </button>
        </form>
      </div>

      {!trackingId && !isLoading && (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border-2 border-dashed border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="text-3xl text-gray-300 dark:text-slate-600" />
          </div>
          <p className="text-gray-400 dark:text-slate-500 font-medium font-outfit">
            Ready to monitor your parcel?
          </p>
        </div>
      )}

      {isLoading && <SkeletonLoader type="table" rows={6} />}

      {trackings.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Real-time Map Section */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden relative group">
            <div className="absolute top-6 left-6 z-1000 flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg border ${
                  isLive
                    ? 'bg-emerald-500/90 text-white border-emerald-400'
                    : 'bg-white/90 dark:bg-slate-900/90 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                }`}
              >
                <FiActivity className={`${isLive ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isLive ? 'Live Stream Active' : 'Static Tracking'}
                </span>
              </div>
              {connected && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Gateway Connected
                  </span>
                </div>
              )}
            </div>

            <div className="h-112.5 w-full rounded-[1.8rem] overflow-hidden grayscale-[0.2] contrast-[1.1] relative">
              <TrackingMap riderLocation={riderLocation} />
            </div>
          </div>

          {/* Details & Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-gray-800 dark:text-slate-100 mb-8 flex items-center gap-2 tracking-tight">
                <FiClock className="text-primary" /> Delivery Journey
              </h3>

              <div className="space-y-0">
                {trackings.map((update, idx) => (
                  <div key={update._id} className="relative flex gap-6 pb-10 group last:pb-0">
                    {idx !== trackings.length - 1 && (
                      <div className="absolute left-6 top-10 bottom-0 w-1 bg-linear-to-b from-primary/50 to-gray-100 dark:to-slate-800 -translate-x-1/2"></div>
                    )}

                    <div
                      className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 ${
                        idx === 0
                          ? 'bg-primary text-white scale-110 ring-4 ring-primary/20'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-slate-600'
                      }`}
                    >
                      <FiCheckCircle className="text-xl" />
                    </div>

                    <div className={`flex-1 pt-1 ${idx === 0 ? 'opacity-100' : 'opacity-60'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-base uppercase tracking-tighter text-gray-800 dark:text-slate-100">
                          {update.status?.replace('_', ' ')}
                        </h4>
                        <span className="text-[10px] font-bold bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded text-gray-500 dark:text-slate-400">
                          {moment(update.time).format('HH:mm A')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed italic">
                        "{update.details}"
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest">
                        <FiMapPin className="text-xs" /> {update.location || 'Central Hub'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group border border-slate-800">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700"></div>
                <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">
                  Tracking Intelligence
                </h4>
                <p className="text-2xl font-black font-mono mb-8 tracking-tighter text-primary dark:text-blue-400">
                  {trackingId}
                </p>

                <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      Last Hub Update
                    </span>
                    <span className="font-bold text-sm">
                      {moment(trackings[0]?.time).fromNow()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      Estimated Arrival
                    </span>
                    <span className="font-bold text-sm">Today, within 6:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <h4 className="font-black text-gray-800 dark:text-slate-100 mb-6 tracking-[0.2em] uppercase text-[10px] text-center">
                  Journey Progress
                </h4>
                <div className="relative h-24 flex items-center justify-center">
                  <div
                    className="radial-progress text-primary"
                    style={
                      {
                        '--value': (trackings.length / 6) * 100,
                        '--size': '6rem',
                        '--thickness': '8px',
                      } as React.CSSProperties
                    }
                    role="progressbar"
                  >
                    <span className="text-sm font-black text-gray-800 dark:text-slate-100">
                      {Math.round((trackings.length / 6) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TrackParcelContent />
    </Suspense>
  );
}
