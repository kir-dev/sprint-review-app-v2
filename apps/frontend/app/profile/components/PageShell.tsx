"use client";

import { PageHeader } from "@/components/PageHeader";
import { User } from "lucide-react";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Profile Settings"
        description="Manage your account information"
        icon={User}
      />
      {children}
    </div>
  );
}
