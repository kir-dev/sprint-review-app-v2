'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { positionColors, positionLabels } from '@/lib/positions';
import { Mail, User } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountInfoCardProps {
  user: UserProfile;
}

export function AccountInfoCard({ user }: AccountInfoCardProps) {
  return (
    <Card className="animate-slide-in-left hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Fiók Információk</CardTitle>
        <CardDescription>
          Adatok az AuthSCH-ból
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Teljes Név
            </label>
            <Input value={user.fullName} readOnly disabled />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </label>
            <Input value={user.email} readOnly disabled />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-medium">Pozíció</label>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${positionColors[user.position]} whitespace-nowrap shrink-0`}>
              {positionLabels[user.position]}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Jelenlegi pozíciód a Kir-Devben
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
