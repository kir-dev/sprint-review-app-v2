import { AppLayout } from '@/components/AppLayout';
import { QueryProvider } from '@/components/QueryProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemedToaster } from '@/components/ThemedToaster';
import { AuthProvider } from '@/context/AuthContext';
import { BrandingProvider } from '@/context/BrandingContext';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cache } from 'react';
import type React from 'react';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const dynamic = 'force-dynamic';

const fetchBrandingSettings = cache(async function fetchBrandingSettings() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${backendUrl}/settings/public`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch branding settings', error);
  }
  return null;
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchBrandingSettings();
  const appName = settings?.appName || 'Sprint Review App';

  return {
    title: 'Sprint Review App',
    description: `Sprint review és munkanapló kezelő a ${appName} számára`,
    icons: {
      icon: settings?.faviconUrl || '/favicon.ico',
      apple: settings?.logoLightUrl || '/Kir-Dev-Black.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Sprint Review App',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchBrandingSettings();
  const primaryColor = settings?.primaryColor || '#f15a29';
  const appName = settings?.appName || 'Sprint Review';

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{
        '--color-primary': primaryColor,
        '--color-ring': primaryColor,
      } as React.CSSProperties}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content={appName} />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <BrandingProvider initialSettings={settings}>
            <QueryProvider>
              <AuthProvider>
                <ServiceWorkerRegister />
                <AppLayout>{children}</AppLayout>
                <ThemedToaster />
              </AuthProvider>
            </QueryProvider>
          </BrandingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
