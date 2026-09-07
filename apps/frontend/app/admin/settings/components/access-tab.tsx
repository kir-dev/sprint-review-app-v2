'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api-fetch';
import { AccessConfirmDialog } from './access-confirm-dialog';
import { accessSchema, accessUpdateSchema, AccessPolicy, AccessUpdate } from './access-schema';

export function AccessTab() {
  const { token, logout } = useAuth();
  const [pending, setPending] = useState<AccessUpdate | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const saveButton = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState<AccessPolicy | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AccessUpdate>({ resolver: zodResolver(accessUpdateSchema) });

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoaded(null);
    setLoadError(false);
    async function load() {
      try {
        const response = await apiFetch('/api/settings/access', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const policy = accessSchema.parse(await response.json());
        if (!controller.signal.aborted) {
          setLoaded(policy);
          reset(accessUpdateSchema.parse(policy));
        }
      } catch {
        if (!controller.signal.aborted) {
          setLoadError(true);
          toast.error('A hozzáférési beállítások betöltése nem sikerült.');
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [token, reset, reload]);

  const save = async (policy: AccessUpdate) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const response = await apiFetch('/api/settings/access', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (response.status === 409) {
        toast.error('Más módosította a beállítást. Az aktuális értékeket újratöltjük.');
        setPending(null);
        setReload((value) => value + 1);
        return;
      }
      if (!response.ok) throw new Error();
      const updated = accessSchema.parse(await response.json());
      setPending(null);
      if (updated.revision !== loaded?.revision) {
        toast.success('Elmentve. A hozzáférési szabály megváltozott, jelentkezz be újra.');
        logout();
      } else {
        setLoaded(updated);
        reset(accessUpdateSchema.parse(updated));
        toast.success('A kör megjelenített neve elmentve.');
      }
    } catch {
      toast.error('A hozzáférési beállítások mentése nem sikerült.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hozzáférés körtagság alapján</CardTitle>
        <CardDescription>
          Az oldalra a beállított kör aktív tagjai és körvezetője léphetnek be. A körtagságot minden
          AuthSCH-belépéskor ellenőrizzük. A munkamenet 7 napig érvényes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!loaded ? (
          <div role="status" className="space-y-3">
            <p>{loadError ? 'Nem sikerült betölteni a beállításokat.' : 'Betöltés...'}</p>
            {loadError && (
              <Button onClick={() => setReload((value) => value + 1)}>Újrapróbálás</Button>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit((policy) => setPending(policy))}
            className="space-y-6 max-w-xl"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">PÉK-körazonosító</p>
              <p className="rounded-md border bg-muted px-3 py-2 font-mono">{loaded.groupId}</p>
              <p className="text-sm text-muted-foreground">
                Ehhez a telepítéshez rögzített kör. Az azonosítót az üzemeltető állítja be, ezen a
                felületen nem módosítható.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-name">Kör neve</Label>
              <Input
                id="group-name"
                maxLength={100}
                aria-invalid={!!errors.groupName}
                aria-describedby="group-name-error"
                {...register('groupName')}
              />
              <p className="text-sm text-muted-foreground">
                Megjelenítésre szolgál; a tagságot az azonosító alapján ellenőrizzük.
              </p>
              <p id="group-name-error" role="alert">
                {errors.groupName?.message}
              </p>
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" {...register('allowAlumni')} className="h-4 w-4" />
              Öregtagok is beléphetnek
            </label>
            <p className="rounded-lg border p-4 text-sm">
              Az öregtagok engedélyének módosítása mindenkinél új belépést kér. Az engedély
              visszavonásával az öregtagok nem tudnak visszalépni. A körnév átírása nem léptet ki
              senkit.
            </p>
            <Button ref={saveButton} type="submit" disabled={!isDirty || isSubmitting || saving}>
              {isSubmitting ? 'Mentés...' : 'Hozzáférés mentése'}
            </Button>
          </form>
        )}
        {loaded && (
          <AccessConfirmDialog
            current={loaded}
            pending={pending}
            saving={saving}
            onCancel={() => setPending(null)}
            onConfirm={() => {
              if (pending) void save(pending);
            }}
            onReturnFocus={() => saveButton.current?.focus()}
          />
        )}
      </CardContent>
    </Card>
  );
}
