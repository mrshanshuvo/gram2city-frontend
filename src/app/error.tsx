'use client';

import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import { FiAlertTriangle, FiArrowLeft, FiHome, FiRefreshCw } from 'react-icons/fi';

interface GlobalErrorProps {
  error?: Error & { digest?: string };
}

const GlobalErrorPage = ({ error }: GlobalErrorProps) => {
  const router = useRouter();

  const title = 'Unexpected Error';
  const message =
    error?.message || 'Something went wrong on our end. Our engineers have been notified.';
  const status = 500;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-urbanist transition-colors">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 shadow-2xl shadow-red-200 dark:shadow-red-950/40">
            <FiAlertTriangle size={48} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-7xl font-black text-slate-900 dark:text-slate-100 mb-4"
        >
          {status}
        </motion.h1>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-tight"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-12 leading-relaxed"
        >
          {message}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <FiArrowLeft /> Go Back
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 cursor-pointer"
          >
            <FiHome /> Back to Home
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => window.location.reload()}
          className="mt-12 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 mx-auto transition-colors cursor-pointer"
        >
          <FiRefreshCw className="animate-spin-slow" /> Try Refreshing the page
        </motion.button>
      </div>
    </div>
  );
};

export default GlobalErrorPage;
