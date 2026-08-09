import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  MapPin,
  Phone,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { User } from '../../features/auth/types';

interface TrackerProps {
  user: User | null;
}

const ProfileCompletionTracker: React.FC<TrackerProps> = ({ user }) => {
  const steps = [
    { id: 'account', label: 'Account Created', isDone: true, icon: UserIcon },
    { id: 'phone', label: 'Phone Number', isDone: !!user?.phone, icon: Phone },
    {
      id: 'address',
      label: 'Pickup Address',
      isDone: !!user?.address,
      icon: MapPin,
    },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  // Status Metaphor
  let statusText = 'Parcel Pending';
  let statusColor = 'bg-amber-500';
  if (percentage > 33) {
    statusText = 'In Transit';
    statusColor = 'bg-blue-500';
  }
  if (percentage === 100) {
    statusText = 'Verified Shipper';
    statusColor = 'bg-primary';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative font-outfit"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/40 rounded-bl-[5rem] -mr-8 -mt-8 z-0" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center lg:text-left">
          <div className="flex items-center gap-2 justify-center lg:justify-start">
            <span
              className={`${statusColor} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}
            >
              {statusText}
            </span>
            {percentage === 100 && (
              <ShieldCheck className="text-[#2E7D32] dark:text-emerald-400" size={18} />
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {percentage === 100 ? 'Identity Fully Verified' : 'Finalize Your Identity'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
            {percentage === 100
              ? 'Your account is fully optimized for nationwide shipping. Happy sending!'
              : 'Complete your profile to unlock all features, including instant parcel booking and tracking.'}
          </p>
        </div>

        {/* Circular Progress */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-32 h-32 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                initial={{ strokeDashoffset: 364.4 }}
                animate={{
                  strokeDashoffset: 364.4 - (364.4 * percentage) / 100,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-[#2E7D32] dark:text-emerald-400"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {percentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                Done
              </span>
            </div>
          </div>
          {percentage < 100 && (
            <Link
              href="/dashboard/updateProfile"
              className="flex items-center gap-1 text-sm font-black text-[#2E7D32] dark:text-emerald-400 hover:gap-2 transition-all cursor-pointer"
            >
              Finish Setup <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Step Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border ${step.isDone ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-dashed'}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.isDone ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
            >
              <step.icon size={20} />
            </div>
            <div className="grow">
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                Step {idx + 1}
              </p>
              <h4
                className={`text-sm font-bold ${step.isDone ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {step.label}
              </h4>
            </div>
            {step.isDone ? (
              <CheckCircle2 className="text-[#2E7D32] dark:text-emerald-400" size={20} />
            ) : (
              <Circle className="text-slate-200 dark:text-slate-700" size={20} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileCompletionTracker;
