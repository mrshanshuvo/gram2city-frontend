'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/authStore';
import { usePathname } from 'next/navigation';

// Sub-components
import Sidebar from '@/components/Dashboard/Sidebar';
import Topbar from '@/components/Dashboard/Topbar';
import ChatWidget from '@/components/Shared/ChatWidget';
import NavigationProgressBar from '@/components/Shared/NavigationProgressBar';
import { Sheet, SheetContent } from '@/components/ui/Sheet';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout: logOut } = useAuthStore();
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname || '');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setActivePath(pathname || '');
  }, [pathname]);

  const closeDrawer = () => {
    setIsMobileOpen(false);
  };

  const pathParts = (pathname || '').split('/').filter((p) => p && p !== 'dashboard');

  const breadcrumbs = [
    'Dashboard',
    ...pathParts.map(
      (p: string) => p.charAt(0).toUpperCase() + p.slice(1).replace(/([A-Z])/g, ' $1'),
    ),
  ];

  const handleLogout = () => {
    logOut();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors font-outfit overflow-hidden">
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block h-full z-40 shrink-0">
        <Sidebar activePath={activePath} closeDrawer={closeDrawer} handleLogout={handleLogout} />
      </aside>

      {/* Mobile Shadcn Sheet Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 border-none w-72">
          <Sidebar activePath={activePath} closeDrawer={closeDrawer} handleLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <NavigationProgressBar />

        <div className="sticky top-0 z-30 w-full">
          <Topbar breadcrumbs={breadcrumbs} onOpenMobileMenu={() => setIsMobileOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 max-w-400 w-full mx-auto animate-in fade-in duration-700">
          {children}
        </main>

        {/* Floating Real-time Chat */}
        <ChatWidget />
      </div>
    </div>
  );
}
