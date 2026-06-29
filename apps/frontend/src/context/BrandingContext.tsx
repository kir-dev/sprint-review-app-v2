'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BrandingSettings {
  appName: string;
  primaryColor: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
}

interface BrandingContextType {
  settings: BrandingSettings;
  updateSettings: (newSettings: Partial<BrandingSettings>) => void;
}

const defaultSettings: BrandingSettings = {
  appName: 'Sprint Review App',
  primaryColor: '#f15a29',
  logoLightUrl: '/Kir-Dev-Black.png',
  logoDarkUrl: '/Kir-Dev-White.png',
  faviconUrl: '/favicon.ico',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: BrandingSettings | null;
}) {
  const [settings, setSettings] = useState<BrandingSettings>(
    initialSettings || defaultSettings
  );

  // Apply primary color variable to root element whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', settings.primaryColor);
      root.style.setProperty('--color-ring', settings.primaryColor);
    }
  }, [settings.primaryColor]);

  // Fetch fresh branding settings on client-side mount to override static prerender fallbacks
  useEffect(() => {
    const fetchClientBranding = async () => {
      try {
        const res = await fetch('/api/settings/public', {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch branding on client side', err);
      }
    };

    fetchClientBranding();
  }, []);

  const updateSettings = (newSettings: Partial<BrandingSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <BrandingContext.Provider value={{ settings, updateSettings }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
