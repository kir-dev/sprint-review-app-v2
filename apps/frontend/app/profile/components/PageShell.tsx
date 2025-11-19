"use client";

import { User } from "lucide-react";

export function ProfileHeader() {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <ProfileHeader />
      {children}
    </div>
  );
}
