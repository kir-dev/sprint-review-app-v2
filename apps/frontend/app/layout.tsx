import { AppLayout } from '@/components/AppLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemedToaster } from '@/components/ThemedToaster';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type React from 'react';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sprint Review App - Kir-Dev',
  description: 'Sprint review and work log management for Kir-Dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <ThemedToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
