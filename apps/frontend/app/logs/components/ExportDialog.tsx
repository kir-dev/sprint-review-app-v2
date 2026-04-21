import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar22 } from '@/components/ui/datepicker';
import { LoadingLogo } from '@/components/ui/LoadingLogo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserData } from '../../users/hooks/useUserData';
import { Download, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { WorkPeriod } from '../types';

interface ExportDialogProps {
  isOpen: boolean;
  token: string | null;
  workPeriods: WorkPeriod[];
  onClose: () => void;
}

type PeriodMode = 'workPeriod' | 'dateRange';

export function ExportDialog({
  isOpen,
  token,
  workPeriods,
  onClose,
}: ExportDialogProps) {
  const { users, isLoading: isLoadingUsers } = useUserData(token);

  const [allUsers, setAllUsers] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [periodMode, setPeriodMode] = useState<PeriodMode>('dateRange');
  const [workPeriodId, setWorkPeriodId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.fullName.localeCompare(b.fullName, 'hu')),
    [users],
  );

  if (!isOpen) return null;

  function toggleUser(id: number) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllUsers(checked: boolean) {
    setAllUsers(checked);
    if (checked) setSelectedUserIds(new Set());
  }

  async function handleExport() {
    if (!token) {
      setError('Nincs érvényes munkamenet.');
      return;
    }
    if (!allUsers && selectedUserIds.size === 0) {
      setError('Válassz ki legalább egy felhasználót, vagy az "Összes felhasználó" opciót.');
      return;
    }

    const params = new URLSearchParams();
    if (!allUsers) {
      params.set('userIds', [...selectedUserIds].join(','));
    }
    if (periodMode === 'workPeriod') {
      if (workPeriodId) params.set('workPeriodId', workPeriodId);
    } else {
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(`/api/logs/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        setError('Nincs jogosultságod a naplók exportálásához.');
        return;
      }
      if (!response.ok) {
        setError('Nem sikerült exportálni a naplókat. Próbáld újra.');
        return;
      }

      const disposition = response.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] ?? `munkanaplok_${new Date().toISOString().split('T')[0]}.csv`;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Export failed', err);
      setError('Hálózati hiba történt az export során.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-slide-in-bottom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Naplók exportálása
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium">Felhasználók</h3>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={allUsers}
                onCheckedChange={(checked) => toggleAllUsers(checked === true)}
              />
              <span>Összes felhasználó</span>
            </label>

            {!allUsers && (
              <div className="border border-input rounded-md max-h-56 overflow-y-auto p-2 space-y-1">
                {isLoadingUsers ? (
                  <div className="py-4 flex justify-center">
                    <LoadingLogo size={32} />
                  </div>
                ) : sortedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    Nincsenek elérhető felhasználók.
                  </p>
                ) : (
                  sortedUsers.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={selectedUserIds.has(u.id)}
                        onCheckedChange={() => toggleUser(u.id)}
                      />
                      <span>{u.fullName}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Időszak</h3>
            <Tabs
              value={periodMode}
              onValueChange={(v) => setPeriodMode(v as PeriodMode)}
            >
              <TabsList>
                <TabsTrigger value="dateRange">Dátum tartomány</TabsTrigger>
                <TabsTrigger value="workPeriod">Időszak</TabsTrigger>
              </TabsList>

              <TabsContent value="dateRange" className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Mettől</label>
                    <Calendar22
                      value={startDate}
                      onChange={setStartDate}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Meddig</label>
                    <Calendar22
                      value={endDate}
                      onChange={setEndDate}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hagyd üresen mindkét mezőt az összes naplóhoz.
                </p>
              </TabsContent>

              <TabsContent value="workPeriod" className="space-y-2">
                <Select
                  value={workPeriodId || undefined}
                  onValueChange={setWorkPeriodId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz időszakot" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {workPeriods.map((wp) => (
                      <SelectItem key={wp.id} value={wp.id.toString()}>
                        {wp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>
          </section>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Mégse
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="transition-all hover:scale-105"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportálás
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
