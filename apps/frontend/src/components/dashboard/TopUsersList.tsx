'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardTopUser } from '@/types/dashboard';
import { Trophy } from 'lucide-react';

interface TopUsersListProps {
  users: DashboardTopUser[];
  loading?: boolean;
}

export function TopUsersList({ users, loading }: TopUsersListProps) {
  if (loading) {
    return <div className="animate-pulse h-64 bg-secondary rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Hozzájárulók
        </CardTitle>
        <CardDescription>A kör legaktívabb tagjai</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
           <div className="h-40 flex items-center justify-center text-muted-foreground">
             Nincs adat.
           </div>
        ) : (
          <div className="space-y-4">
              {users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                            <div className={`
                                flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30' : 
                                  index === 1 ? 'bg-slate-300/20 text-slate-600 border border-slate-400/30' :
                                  index === 2 ? 'bg-amber-700/20 text-amber-700 border border-amber-700/30' : 
                                  'bg-secondary text-muted-foreground'}
                            `}>
                                {index + 1}
                            </div>
                            <span className="font-medium">{user.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{user.hours} óra</span>
                  </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
