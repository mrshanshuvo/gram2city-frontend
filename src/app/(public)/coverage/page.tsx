'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ShieldCheck,
  Navigation,
  Globe2,
} from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import { fetchWarehouses } from '@/features/landing/api';
import { ServiceCenter } from '@/features/riders/types';

const REGIONS = [
  'All',
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

export default function CoveragePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'limited' | 'coming-soon'>(
    'all',
  );

  const { data: warehouses = [], isLoading } = useQuery<ServiceCenter[]>({
    queryKey: queryKeys.landing.warehouses(),
    queryFn: fetchWarehouses,
    staleTime: 5 * 60 * 1000,
  });

  const filteredHubs = useMemo(() => {
    return warehouses.filter((hub) => {
      const matchesSearch =
        searchQuery === '' ||
        hub.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.covered_area?.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRegion =
        selectedRegion === 'All' || hub.region?.toLowerCase() === selectedRegion.toLowerCase();

      const matchesStatus = statusFilter === 'all' || hub.status === statusFilter;

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [warehouses, searchQuery, selectedRegion, statusFilter]);

  const activeCount = warehouses.filter((w) => w.status === 'active').length;
  const totalCoveredAreas = warehouses.reduce(
    (acc, curr) => acc + (curr.covered_area?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-urbanist pb-20">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24 md:pt-36 md:pb-28 bg-slate-900 bg-linear-to-b from-slate-950 via-slate-900 to-slate-900 text-white"
        style={{ backgroundColor: '#0f172a' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
              <Globe2 size={14} /> Nationwide Logistics Coverage
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
              Connecting All <span className="text-emerald-400">64 Districts</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              From metropolitan commerce hubs to rural village doorsteps — check our operational
              delivery hubs, express pickup zones, and covered Upazilas across Bangladesh.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by District, City, or Upazila (e.g. Dhanmondi, Bogura, Sylhet)..."
                className="w-full pl-12 pr-16 py-3.5 sm:py-4 rounded-2xl bg-slate-800/90 text-white placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-slate-800 transition-all text-sm sm:text-base shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-semibold px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Metric Strip ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {warehouses.length || 64}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Service Hubs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {activeCount || 52}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Active Hubs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {totalCoveredAreas || '495+'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Covered Upazilas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Doorstep Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs & Grid ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Region Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedRegion === region
                    ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['all', 'active', 'limited', 'coming-soon'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-6 px-1">
          <span>Showing {filteredHubs.length} regional delivery hubs</span>
          {searchQuery && <span>Filtered by: &ldquo;{searchQuery}&rdquo;</span>}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse p-6"
              />
            ))}
          </div>
        )}

        {/* Hubs Grid */}
        {!isLoading && filteredHubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHubs.map((hub) => {
              const statusColor =
                hub.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                  : hub.status === 'limited'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';

              const statusIcon =
                hub.status === 'active' ? (
                  <CheckCircle2 size={12} className="inline mr-1" />
                ) : hub.status === 'limited' ? (
                  <AlertCircle size={12} className="inline mr-1" />
                ) : (
                  <Clock size={12} className="inline mr-1" />
                );

              return (
                <motion.div
                  key={hub._id || `${hub.district}-${hub.city}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                          {hub.region || 'Bangladesh'} Region
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin size={18} className="text-emerald-500 shrink-0" />
                          {hub.district}
                        </h3>
                      </div>
                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider shrink-0 ${statusColor}`}
                      >
                        {statusIcon}
                        {hub.status.replace('-', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
                      Central Hub:{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {hub.city}
                      </span>
                    </p>

                    {/* Covered Areas */}
                    {hub.covered_area && hub.covered_area.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Covered Upazilas & Zones ({hub.covered_area.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {hub.covered_area.map((area, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Coordinates / GPS link */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {hub.latitude?.toFixed(4)}, {hub.longitude?.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${hub.latitude},${hub.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:text-emerald-600 font-sans font-bold flex items-center gap-1 transition"
                    >
                      View on Map →
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredHubs.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No delivery hubs found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              We couldn&apos;t find any hubs matching &ldquo;{searchQuery}&rdquo;. Try another
              district or region name.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('All');
                setStatusFilter('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
