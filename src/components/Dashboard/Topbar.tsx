'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { FiMenu, FiChevronRight, FiPackage, FiUserPlus } from 'react-icons/fi';
import NotificationBell from '@/components/Shared/NotificationBell/NotificationBell';
import { useSocketStore } from '@/store/useSocketStore';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/auth/authStore';
import { useHeaderStore } from '@/store/useHeaderStore';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/Shared/ThemeProvider';

interface TopbarProps {
  breadcrumbs: string[];
  onOpenMobileMenu?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ breadcrumbs, onOpenMobileMenu }) => {
  const { user, role } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { socket } = useSocketStore();
  const { title: storeTitle, subtitle } = useHeaderStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTitle = storeTitle || breadcrumbs[breadcrumbs.length - 1];

  // Listen for Real-time Admin Alerts
  useEffect(() => {
    if (socket && (role === 'admin' || role === 'superAdmin')) {
      console.log('🛠️ Admin Real-time Listener Active');

      // Alert 1: New Parcel Booked
      socket.on('new_parcel', (data) => {
        toast.info(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-tighter">
              <FiPackage /> New Shipment Booked
            </div>
            <p className="text-[10px] text-gray-500 font-bold">
              ID: {data.trackingId} • Destination: {data.destination}
            </p>
          </div>,
          {
            icon: false,
            className: 'rounded-2xl border-l-4 border-blue-500 shadow-xl',
          },
        );
      });

      // Alert 2: New Rider Application
      socket.on('new_rider_application', (data) => {
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-tighter">
              <FiUserPlus /> New Rider Application
            </div>
            <p className="text-[10px] text-gray-500 font-bold">
              {data.name} from {data.district} applied.
            </p>
          </div>,
          {
            icon: false,
            className: 'rounded-2xl border-l-4 border-emerald-500 shadow-xl',
          },
        );
      });

      return () => {
        socket.off('new_parcel');
        socket.off('new_rider_application');
      };
    }
  }, [socket, role]);

  return (
    <>
      {/* Mobile Navbar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 shadow-sm lg:hidden px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <span className="text-lg font-black tracking-tighter text-slate-800 dark:text-slate-100">
            Gram2City
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {mounted && theme === 'dark' ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>
          <NotificationBell />
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary">
              {mounted && user?.photoURL ? (
                <Image
                  src={user.photoURL}

                  width={32}
                  height={32}
                  className="object-cover rounded-full"
                  alt="User"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                  {mounted && (user?.displayName || user?.email)
                    ? (user.displayName || user.email || '').charAt(0).toUpperCase()
                    : 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Topbar */}
      <header className="hidden lg:flex h-20 items-center justify-between px-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-30 border-b border-white/20 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <span
                    className={i === breadcrumbs.length - 1 ? 'text-primary transition-colors' : ''}
                  >
                    {crumb}
                  </span>
                  {i < breadcrumbs.length - 1 && <FiChevronRight className="text-gray-300" />}
                </React.Fragment>
              ))}
            </nav>
            <h1 className="text-lg font-black text-gray-800 dark:text-slate-100 tracking-tight mt-0.5 flex items-center gap-3">
              {displayTitle}
              {subtitle && (
                <span className="text-[10px] font-bold text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3 uppercase tracking-widest">
                  {subtitle}
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 shadow-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-all cursor-pointer"
          >
            {mounted && theme === 'dark' ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 p-1.5 pr-4 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-700/60">
            <NotificationBell />
            <div className="h-8 w-px bg-gray-100 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3 pr-2">
              <div className="text-right">
                <p className="text-xs font-black text-gray-800 dark:text-slate-100 leading-none">
                  {mounted ? user?.name || user?.displayName || user?.email?.split('@')[0] : ''}
                </p>
                <p className="text-[10px] uppercase font-bold text-primary tracking-tighter mt-1">
                  {mounted ? role || 'User' : ''}
                </p>
              </div>
              {mounted && user?.photoURL && !user.photoURL.includes('undefined') ? (
                <Image
                  src={user.photoURL}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl shadow-md border-2 border-white object-cover"
                  alt="User"
                  onError={(e) => {
                    // Fallback on load error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl shadow-md border-2 border-white bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-sm shrink-0">
                  {mounted && (user?.name || user?.displayName || user?.email)
                    ? (user.name || user.displayName || user.email || '').charAt(0).toUpperCase()
                    : 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Topbar;
