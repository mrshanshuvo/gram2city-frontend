'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';

import { FiBell, FiCheckCircle, FiInfo, FiCreditCard } from 'react-icons/fi';
import moment from 'moment';

import { Notification } from '@/features/notifications/types';
import {
  fetchUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/features/notifications/api';

const NotificationBell: React.FC = () => {
  const { user } = useAuthStore();

  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.email],
    queryFn: () => {
      if (!user?.email) return [];
      return fetchUserNotifications(user.email);
    },
    enabled: !!user?.email,
    refetchInterval: 30000, // Refetch every 30s
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', user?.email],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!user?.email) return Promise.resolve();
      return markAllNotificationsRead(user.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', user?.email],
      });
    },
  });

  const handleMarkRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <FiCreditCard className="text-green-500" />;
      case 'status_update':
        return <FiCheckCircle className="text-blue-500" />;
      default:
        return <FiInfo className="text-primary" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <div className="relative">
          <FiBell className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
              {notifications.length}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 z-20 overflow-hidden transform origin-top-right transition-all font-outfit">
            <div className="bg-primary p-4 text-white flex justify-between items-center shadow-lg">
              <div className="flex flex-col">
                <h3 className="font-black text-base">Notifications</h3>
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none mt-1">
                  {notifications.length} Unread Updates
                </span>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-black bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-widest"
                >
                  <FiCheckCircle className="h-2.5 w-2.5" /> MARK ALL READ
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                  <FiBell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="font-bold text-sm">All caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="p-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex gap-3 items-start"
                    onClick={() => handleMarkRead(notif._id)}
                  >
                    <div className="mt-1 p-2 bg-gray-100 dark:bg-slate-800 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-slate-200 leading-tight">
                        {notif.message}
                      </p>
                      <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 mt-1 block">
                        {moment(notif.time).fromNow()}
                      </span>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-slate-800/50 text-center border-t border-gray-100 dark:border-slate-800">
                <button className="text-xs text-primary dark:text-blue-400 font-black hover:underline cursor-pointer uppercase tracking-widest">
                  View All Activity
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
