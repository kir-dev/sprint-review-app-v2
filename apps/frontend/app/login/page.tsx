'use client';

import { browserBackendUrl } from '@/lib/clientEnv';
import { authErrorMessage } from '@/lib/api-fetch';
import { LoadingLogo } from '@/components/ui/LoadingLogo';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, user, token, isLoading, error } = useAuth();
  const callbackError = searchParams.get('error');
  const visibleError = callbackError ? authErrorMessage(callbackError) : error;
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
    const jwtFromUrl = searchParams.get('jwt');
    if (jwtFromUrl && !callbackError && !isLoading && !token && !error) {
      // Consume the callback token once, including when validation fails.
      window.history.replaceState(null, '', '/login');
      login(jwtFromUrl);
    }
  }, [searchParams, callbackError, isLoading, token, error, login]);

  useEffect(() => {
    if (!callbackError && !isLoading && user && token) router.replace('/dashboard');
  }, [callbackError, user, token, isLoading, router]);

  if (!visibleError && (isLoading || (token && user))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark px-4">
        <LoadingLogo size={60} />
      </div>
    );
  }

  const handleLogin = () => {
    logout();
    // Redirect to backend AuthSCH login
    window.location.href = `${browserBackendUrl()}/auth/login`;
  };

  const appName = settings?.appName || 'Sprint Review App';
  const logoSrc = settings?.logoDarkUrl || '/Kir-Dev-White.png';

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
      <div className="bg-dark-lighter border border-dark rounded-3xl shadow-2xl p-6 md:p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <img src={logoSrc} alt={appName} className="max-w-48 h-auto" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{appName}</h1>
        <p className="text-gray-400 mb-10">Jelentkezz be az AuthSCH-val a folytatáshoz</p>

        {visibleError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm font-medium">{visibleError}</p>
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
