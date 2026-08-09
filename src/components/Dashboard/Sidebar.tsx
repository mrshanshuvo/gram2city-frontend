'use client';
import Link from 'next/link';
import {
  FiChevronRight,
  FiSettings,
  FiLogOut,
  FiPackage,
  FiUserCheck,
  FiCheck,
  FiCreditCard,
  FiDollarSign,
  FiMessageSquare,
  FiHeart,
  FiMapPin,
} from 'react-icons/fi';
import {
  MdOutlineGroups,
  MdOutlinePending,
  MdDashboard,
  MdOutlineLocalShipping,
} from 'react-icons/md';
import { FaMotorcycle } from 'react-icons/fa';
import React from 'react';
import Gram2CityLogo from '@/components/Shared/Gram2CityLogo/Gram2CityLogo';

import { useAuthStore } from '@/features/auth/authStore';

import { NavLinkItem, SidebarProps } from '@/types';

const Sidebar: React.FC<SidebarProps> = ({ activePath, closeDrawer, handleLogout }) => {
  const { role, isLoading: roleLoading } = useAuthStore();
  const navGroups = [
    {
      title: 'Overview',
      links: [{ to: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> }],
    },
    ...(!roleLoading && role === 'admin'
      ? [
          {
            title: 'System Console',
            links: [
              {
                to: '/dashboard/allParcels',
                label: 'Fleet Monitor',
                icon: <FiPackage />,
              },
              {
                to: '/dashboard/allCustomers',
                label: 'All Customers',
                icon: <FiUserCheck />,
              },
              {
                to: '/dashboard/messages',
                label: 'Support Desk',
                icon: <FiMessageSquare />,
              },

              {
                to: '/dashboard/manage-merchants',
                label: 'Merchant Hub',
                icon: <FiUserCheck />,
              },
              {
                to: '/dashboard/assignRider',
                label: 'Dispatch Center',
                icon: <FaMotorcycle />,
              },
              {
                to: '/dashboard/financialSettings',
                label: 'Financial Settings',
                icon: <FiDollarSign />,
              },
              {
                to: '/dashboard/approvedRiders',
                label: 'Rider Management',
                icon: <MdOutlineGroups />,
              },
              {
                to: '/dashboard/pendingRiders',
                label: 'Onboarding',
                icon: <MdOutlinePending />,
              },
              {
                to: '/dashboard/makeAdmins',
                label: 'Staff Roles',
                icon: <FiUserCheck />,
              },
              {
                to: '/dashboard/adminFeedback',
                label: 'System Reviews',
                icon: <FiHeart />,
              },
              {
                to: '/dashboard/landingPageManager',
                label: 'Landing Manager',
                icon: <MdDashboard />,
              },
            ],
          },
        ]
      : []),
    ...(!roleLoading && role === 'merchant'
      ? [
          {
            title: 'Business Portal',
            links: [
              {
                to: '/dashboard/merchantParcels',
                label: 'B2B Shipments',
                icon: <FiPackage />,
              },
              {
                to: '/dashboard/paymentHistory',
                label: 'COD Wallet',
                icon: <FiCreditCard />,
              },
            ],
          },
        ]
      : []),
    ...(!roleLoading && role === 'rider'
      ? [
          {
            title: 'Rider Console',
            links: [
              {
                to: '/dashboard/pendingDeliveries',
                label: 'Active Tasks',
                icon: <MdOutlinePending />,
              },
              {
                to: '/dashboard/completedDeliveries',
                label: 'Logbook',
                icon: <FiCheck />,
              },
              {
                to: '/dashboard/myEarnings',
                label: 'Wallet',
                icon: <FiCreditCard />,
              },
            ],
          },
        ]
      : []),
    ...(!roleLoading && (role === 'user' || role === 'admin')
      ? [
          {
            title: 'Personal Portal',
            links: [
              {
                to: '/dashboard/myParcels',
                label: 'My Orders',
                icon: <FiPackage />,
              },
              {
                to: '/dashboard/trackParcel',
                label: 'Live Tracking',
                icon: <MdOutlineLocalShipping />,
              },
              {
                to: '/dashboard/paymentHistory',
                label: 'Invoices',
                icon: <FiCreditCard />,
              },
            ],
          },
        ]
      : []),
    ...(!roleLoading && (role === 'user' || role === 'rider' || role === 'admin')
      ? [
          {
            title: 'Support & Feedback',
            links: [
              {
                to: '/dashboard/feedback',
                label: 'Submit Feedback',
                icon: <FiMessageSquare />,
              },
            ],
          },
        ]
      : []),
    {
      title: 'Account Settings',
      links: [
        {
          to: '/dashboard/updateProfile',
          label: 'Security & Profile',
          icon: <FiSettings />,
        },
        {
          to: '/dashboard/addresses',
          label: 'Address Book',
          icon: <FiMapPin />,
        },
      ],
    },
  ];

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col h-full shadow-2xl lg:shadow-none transition-colors">
      {/* Logo Section */}
      <div className="pt-4 px-6">
        <Gram2CityLogo />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-4 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              {group.title}
            </h3>
            <ul className="space-y-1.5">
              {group.links.map(({ to, label, icon }: NavLinkItem) => (
                <li key={to}>
                  <Link
                    href={to}
                    onClick={closeDrawer}
                    className={`
                      flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
                      ${
                        activePath === to
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-primary dark:hover:text-slate-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm font-bold tracking-tight">{label}</span>
                    </div>
                    <FiChevronRight
                      className={`text-xs opacity-0 transition-all ${activePath === to ? 'hidden' : 'group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User Quick Actions */}
      <div className="p-6 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-sm rounded-2xl h-12 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <FiLogOut className="text-lg" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
