import { AppLayout } from '@/components/AppLayout';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemedToaster } from '@/components/ThemedToaster';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Sprint Review App - Kir-Dev',
  description: 'Sprint review és munkanapló kezelő a Kir-Dev számára',
  icons: {
    icon: '/favicon.ico',
    apple: '/Kir-Dev-Black.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sprint Review',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Sprint Review" />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <ServiceWorkerRegister />
            <AppLayout>{children}</AppLayout>
            <ThemedToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
