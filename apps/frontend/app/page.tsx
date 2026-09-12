'use client';

import { LoadingLogo } from '@/components/ui/LoadingLogo';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated === true) {
        router.push('/dashboard');
      } else if (isAuthenticated === false) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingLogo size={60} />
    </div>
  );
}
