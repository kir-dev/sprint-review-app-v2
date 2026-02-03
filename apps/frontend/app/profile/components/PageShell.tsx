"use client";

import { PageHeader } from "@/components/PageHeader";
import { User } from "lucide-react";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto">
      <PageHeader
        title="Profil Beállítások"
        description="Fiók információk kezelése"
        icon={User}
      />
      {children}
    </div>
  );
}
