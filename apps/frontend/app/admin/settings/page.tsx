'use client';

import React, { useState } from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { Palette, Sliders, AlertCircle, Settings } from 'lucide-react';
import { BrandingTab } from './components/BrandingTab';
import { RolesTab } from './components/RolesTab';

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('branding');

  // Check permissions: Circle leader (KORVEZETO) or users with settings manage flag
  const canAccess =
    user?.position === 'KORVEZETO' || user?.positionDetails?.canManageSettings === true;

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 text-red-500">
              <AlertCircle size={48} />
            </div>
            <CardTitle className="text-2xl text-red-500">Hozzáférés megtagadva</CardTitle>
            <CardDescription className="text-gray-400">
              Ez az oldal kizárólag a Körvezető és a rendszerbeállítások kezelésére jogosult szerepkörök számára érhető el.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.href = '/dashboard'}>Vissza a Dashboardra</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 md:pt-4 space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Kör adminisztráció"
        description="Itt szabhatod személyre a kör arculatát, kezelheted a szerepköröket és jogosultságokat."
        icon={Settings}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 max-w-md bg-card border">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette size={16} /> Arculat
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Sliders size={16} /> Szerepkörök
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Branding */}
        <TabsContent value="branding">
          <BrandingTab />
        </TabsContent>

        {/* Tab 2: Roles & Positions */}
        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
