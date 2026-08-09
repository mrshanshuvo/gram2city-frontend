'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { Toaster } from 'sonner';
import AuthInitializer from '../AuthInitializer';
import { ThemeProvider } from '@/components/Shared/ThemeProvider';
import { useEffect } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Aos.init();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              borderRadius: '1.25rem',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            classNames: {
              success: '!bg-primary/95 !text-white shadow-2xl shadow-[#2E7D32]/20',
              error: '!bg-red-600/95 !text-white shadow-2xl shadow-red-600/20',
              info: '!bg-secondary/95 !text-white shadow-2xl shadow-[#1E5AA8]/20',
              warning: '!bg-accent/95 !text-slate-900 shadow-2xl shadow-[#F4C20D]/20',
              toast: 'group !backdrop-blur-2xl !border-white/20',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
