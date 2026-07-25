'use client';

import { LoadingLogo } from '@/components/ui/LoadingLogo';
import { browserBackendUrl } from '@/lib/clientEnv';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, token, isLoading, error } = useAuth();
  const [settings, setSettings] = useState<{ appName: string; logoDarkUrl: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings/public', { cache: 'no-store' })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to fetch public settings on login page', err));
  }, []);

  useEffect(() => {
    // Check if JWT is in URL (from OAuth callback)
    const jwtFromUrl = searchParams.get('jwt');
    if (jwtFromUrl && !error && !token) {
      console.log('🔑 JWT found in URL, calling login()');
      login(jwtFromUrl);
      // Don't redirect immediately to allow fetchUser to complete/fail
      // The other useEffect will handle the redirect on success
    }
  }, [searchParams, login, error, token]);

  // Redirect to dashboard when user is loaded
  useEffect(() => {
    console.log('🔄 Auth state:', {
      isLoading,
      hasUser: !!user,
      hasToken: !!token,
    });
    if (!isLoading && user && token) {
      console.log('✅ Redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, token, isLoading, router]);

  // If JWT is in URL, show loading instead of login form
  // But ONLY if we don't have an error
  const jwtFromUrl = searchParams.get('jwt');
  const showLoading = (jwtFromUrl || (token && user)) && !error;

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark px-4">
        <LoadingLogo size={60} />
      </div>
    );
  }

  const handleLogin = () => {
    // Redirect the browser straight to the backend AuthSCH login (keeps the
    // OAuth flow on the backend origin). URL comes from runtime config.
    window.location.href = `${browserBackendUrl()}/auth/login`;
  };

  const appName = settings?.appName || 'Sprint Review App';
  const logoSrc = settings?.logoDarkUrl || '/Kir-Dev-White.png';

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
      <div className="bg-dark-lighter border border-dark rounded-3xl shadow-2xl p-6 md:p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <img
            src={logoSrc}
            alt={appName}
            className="max-w-48 h-auto"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          {appName}
        </h1>
        <p className="text-gray-400 mb-10">
          Jelentkezz be az AuthSCH-val a folytatáshoz
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-[1.02]"
        >
          Bejelentkezés AuthSCH-val
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-dark px-4">
          <LoadingLogo size={60} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
