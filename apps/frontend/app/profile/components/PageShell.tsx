"use client";

import { PageHeader } from "@/components/PageHeader";
import { User } from "lucide-react";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Profil Beállítások"
        description="Fiók információk kezelése"
        icon={User}
      />
      {children}
    </div>
  );
}
