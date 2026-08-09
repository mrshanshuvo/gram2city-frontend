'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';

import { FiPackage, FiDollarSign, FiStar, FiClock, FiMessageSquare, FiAward } from 'react-icons/fi';
import { fetchRiderStats, fetchRiderReviews } from '@/features/riders/api';
import { Review } from '@/features/riders/types';
import moment from 'moment';
import { usePageHeader } from '@/hooks/usePageHeader';

const RiderDashboard = () => {
  const { user } = useAuthStore();

  usePageHeader('Rider Control Center', 'Tracking your impact as a Gram2City Hero');

  // Fetch Rider Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['rider-stats', user?.email],
    queryFn: () => {
      if (!user?.email) return null;
      return fetchRiderStats(user.email);
    },
    enabled: !!user?.email,
  });

  // Fetch Rider Reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['rider-reviews', user?.email],
    queryFn: () => {
      if (!user?.email) return [];
      return fetchRiderReviews(user.email);
    },
    enabled: !!user?.email,
  });

  if (statsLoading || reviewsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Delivered',
      value: stats?.totalDelivered || 0,
      icon: <FiPackage />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Earnings',
      value: `৳${stats?.totalEarnings?.toFixed(2) || 0}`,
      icon: <FiDollarSign />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Avg Rating',
      value: `${stats?.avgRating?.toFixed(1) || 0} / 5`,
      icon: <FiStar />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'New Reviews',
      value: reviews.length,
      icon: <FiMessageSquare />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 pb-12 font-outfit">
      <div className="flex justify-end pt-2 gap-3">
        {user?.vehicleType && (
          <div className="badge badge-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 p-4 rounded-2xl gap-2 font-black shadow-sm uppercase tracking-tighter">
            Fleet: {user.vehicleType}
          </div>
        )}
        <div className="badge badge-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl gap-2 font-bold shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Online & Ready
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-2xl ${card.bg} dark:bg-slate-800 ${card.color} dark:text-slate-100 text-2xl group-hover:scale-110 transition-transform`}
              >
                {card.icon}
              </div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                {card.label}
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-slate-100">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reviews List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <FiMessageSquare className="text-amber-500" /> Recent Feedback
            </h3>
            <button className="text-sm font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer">
              View All
            </button>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {reviews.length === 0 ? (
              <div className="p-12 text-center text-gray-400 dark:text-slate-500">
                <FiStar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">
                  No reviews received yet. Your hard work will be rewarded soon!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-6 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-black text-gray-500 dark:text-slate-400">
                        {review.user_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 dark:text-slate-100">
                          {review.user_name || 'Anonymous User'}
                        </h4>
                        <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                          <FiClock /> {moment(review.date).fromNow()}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 text-sm">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar key={s} fill={s <= review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed italic bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border-l-4 border-amber-300 dark:border-amber-500">
                    "{review.comment || 'Great delivery service, very punctual!'}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tips / Goals Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none border border-slate-800 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-6 backdrop-blur-md text-amber-400">
                <FiAward />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-wider">Hero Status</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed font-medium">
                You are <span className="text-white font-black">8 missions</span> away from the
                <span className="text-amber-400 font-black"> Gold Runner</span> badge!
              </p>
              <button className="btn btn-sm bg-white border-none text-slate-900 font-black px-6 hover:bg-slate-100 h-10 rounded-xl shadow-lg cursor-pointer">
                View Perks
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h4 className="font-black text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-widest text-[10px]">
              Weekly Progress
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-black mb-2 text-slate-600 dark:text-slate-300">
                  <span>Missions (12/20)</span>
                  <span className="text-primary dark:text-blue-400">60%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-primary dark:bg-blue-500 h-full w-[60%] rounded-full shadow-lg shadow-primary/30"></div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  TIP: Complete 5 more "Large Pickup" deliveries this week to earn a ৳500 bonus!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
