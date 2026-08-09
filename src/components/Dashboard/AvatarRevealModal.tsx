'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Ship } from 'lucide-react';
import { useAuthStore } from '../../features/auth/authStore';

const AvatarRevealModal = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeenReveal = localStorage.getItem(`reveal_seen_${user.uid}`);
      if (!hasSeenReveal) {
        // Trigger reveal after a short delay
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const closeReveal = () => {
    if (user) {
      localStorage.setItem(`reveal_seen_${user.uid}`, 'true');
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-[3px]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-10 overflow-hidden shadow-2xl text-center border border-slate-100 dark:border-slate-800 font-outfit"
          >
            {/* Background Sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  className="absolute left-1/2 top-1/2 w-2 h-2 bg-accent rounded-full blur-[1px]"
                />
              ))}
            </div>

            <button
              onClick={closeReveal}
              className="absolute top-6 right-6 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className="relative space-y-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-1 bg-accent rounded-full mb-6" />
                <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  Welcome to <br />
                  <span className="text-[#2E7D32] dark:text-emerald-400">Gram2City</span>
                </h2>
              </motion.div>

              {/* Avatar Box */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 20,
                    delay: 0.6,
                  }}
                  className="relative"
                >
                  <div className="w-48 h-48 rounded-3xl bg-slate-50 dark:bg-slate-800 border-8 border-white dark:border-slate-800 shadow-2xl overflow-hidden relative group">
                    <Image
                      src={user?.photoURL || ''}
                      fill
                      sizes="192px"
                      className="w-full h-full object-cover"
                      alt="Assigned Avatar"
                    />
                    {/* Gloss Effect */}
                    <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent dark:from-white/10 pointer-events-none" />
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -bottom-4 -right-4 p-4 bg-primary text-white rounded-2xl shadow-xl border-4 border-white dark:border-slate-900"
                  >
                    <Ship size={24} />
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="space-y-6"
              >
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base px-4 leading-relaxed">
                  We've assigned you a{' '}
                  <strong className="text-slate-700 dark:text-slate-200">
                    unique explorer avatar
                  </strong>{' '}
                  to get you started! Feel free to keep it or upload your own photo later.
                </p>
                <button
                  onClick={closeReveal}
                  className="w-full py-4 bg-primary hover:bg-secondary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Sparkles size={20} />
                  Start Shipping
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AvatarRevealModal;
