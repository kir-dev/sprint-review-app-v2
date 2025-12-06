'use client';

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickLog() {
  const router = useRouter();

  return (
    <Button 
      className="gap-2 hover:scale-105 transition-transform"
      onClick={() => router.push('/logs?new=true')}
    >
      <Plus className="h-4 w-4" />
      Napló Bejegyzés
    </Button>
  );
}
