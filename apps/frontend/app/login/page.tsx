'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, token, isLoading } = useAuth();

  useEffect(() => {
    // Check if JWT is in URL (from OAuth callback)
    const jwtFromUrl = searchParams.get('jwt');
    if (jwtFromUrl) {
      console.log('🔑 JWT found in URL, calling login()');
      login(jwtFromUrl);
      // Immediately redirect to dashboard
      router.push('/dashboard');
    }
  }, [searchParams, login, router]);

  // Redirect to dashboard when user is loaded
  useEffect(() => {
    console.log('🔄 Auth state:', { isLoading, hasUser: !!user, hasToken: !!token });
    if (!isLoading && user && token) {
      console.log('✅ Redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, token, isLoading, router]);

  // If JWT is in URL, show loading instead of login form
  const jwtFromUrl = searchParams.get('jwt');
  if (jwtFromUrl || (token && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Bejelentkezés...</p>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    // Redirect to backend AuthSCH login
    window.location.href = 'http://localhost:3001/auth/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
      <div className="bg-dark-lighter border border-dark rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <img src="Kir-Dev-White.png" alt="Kir-Dev Logo" className="max-w-48 h-auto" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Sprint Review App
        </h1>
        <p className="text-gray-400 mb-10">
          Jelentkezz be az AuthSCH-val a folytatáshoz
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-primary/20"
        >
          Bejelentkezés AuthSCH-val
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Betöltés...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
