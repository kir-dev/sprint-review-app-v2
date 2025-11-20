'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, User } from 'lucide-react';
import { UserProfile } from '../types';
import { positionLabels, positionColors } from '@/lib/positions';

interface AccountInfoCardProps {
  user: UserProfile;
}

export function AccountInfoCard({ user }: AccountInfoCardProps) {
  return (
    <Card className="animate-slide-in-left hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Information from AuthSCH (cannot be edited here)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </label>
            <Input value={user.fullName} readOnly disabled />
            <p className="text-xs text-muted-foreground">Managed by AuthSCH</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </label>
            <Input value={user.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">Managed by AuthSCH</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-medium">Position</label>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={positionColors[user.position]}>
              {positionLabels[user.position]}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Your current position in the organization
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
