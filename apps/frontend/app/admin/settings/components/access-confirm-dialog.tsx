'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccessPolicy, AccessUpdate } from './access-schema';

interface AccessConfirmDialogProps {
  current: AccessPolicy;
  pending: AccessUpdate | null;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onReturnFocus: () => void;
}

export function AccessConfirmDialog({
  current,
  pending,
  saving,
  onCancel,
  onConfirm,
  onReturnFocus,
}: AccessConfirmDialogProps) {
  const cancelButton = useRef<HTMLButtonElement>(null);
  const accessChanges = pending && pending.allowAlumni !== current.allowAlumni;

  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open && !saving) onCancel();
      }}
    >
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelButton.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onReturnFocus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Hozzáférési beállítások mentése?</DialogTitle>
          <DialogDescription>
            {accessChanges
              ? 'A módosítás mindenkinél új belépést kér. Az új szabálynak nem megfelelő tagok nem tudnak visszalépni.'
              : 'A kör megjelenített neve változik. A jelenlegi munkamenetek érvényesek maradnak.'}
          </DialogDescription>
        </DialogHeader>
        {pending && (
          <dl className="space-y-3 text-sm">
            {pending.groupName !== current.groupName && (
              <div>
                <dt>Kör neve</dt>
                <dd>
                  {current.groupName} → {pending.groupName}
                </dd>
              </div>
            )}
            {pending.allowAlumni !== current.allowAlumni && (
              <div>
                <dt>Öregtagok hozzáférése</dt>
                <dd>{pending.allowAlumni ? 'Engedélyezve lesz' : 'Tiltva lesz'}</dd>
              </div>
            )}
          </dl>
        )}
        <DialogFooter className="gap-2">
          <Button
            ref={cancelButton}
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onCancel}
          >
            Mégse
          </Button>
          <Button type="button" disabled={saving} onClick={onConfirm}>
            {saving ? 'Mentés...' : 'Megerősítem a mentést'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
