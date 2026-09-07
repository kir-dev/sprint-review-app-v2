'use client';

import { useTheme } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { MobileBottomNav } from './MobileBottomNav';
import { Sidebar } from './sidebar';
import { useBranding } from '@/context/BrandingContext';

// Pages that should NOT show the sidebar/bottom nav
const pagesWithoutSidebar = ['/login'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !pagesWithoutSidebar.includes(pathname);
  const { theme } = useTheme();
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (showSidebar && !isLoading && (!user || !token)) router.replace('/login');
  }, [showSidebar, isLoading, user, token, router]);
  const { settings } = useBranding();
  const logoSrc =
    theme === 'light' ? settings.logoLightUrl : settings.logoDarkUrl;

  if (!showSidebar) {
    return <>{children}</>;
  }

  if (isLoading || !user || !token) return <div role="status" className="p-8">Betöltés...</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto bg-background flex flex-col pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center">
              <img
                src={logoSrc}
                alt={settings.appName}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg">{settings.appName}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/profile"
              className="relative h-8 w-8 rounded-full overflow-hidden bg-primary/10"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary font-semibold text-xs">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </Link>
          </div>
        </div>

        <div className="md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
