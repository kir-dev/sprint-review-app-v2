'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';

const isHexColor = (val: string) => /^#[0-9A-F]{6}$/i.test(val);

const mapTailwindClassToHex = (className: string): string => {
  if (isHexColor(className)) {
    return className;
  }
  const lower = className.toLowerCase();
  if (lower.includes('slate')) return '#64748b';
  if (lower.includes('orange')) return '#f15a29';
  if (lower.includes('purple')) return '#7c3aed';
  if (lower.includes('pink')) return '#db2777';
  if (lower.includes('indigo')) return '#4f46e5';
  if (lower.includes('emerald') || lower.includes('green')) return '#10b981';
  if (lower.includes('yellow')) return '#ca8a04';
  if (lower.includes('red')) return '#dc2626';
  return '#64748b';
};

export interface PositionData {
  id: number;
  name: string;
  label: string;
  color: string;
  canManageSettings: boolean;
  canExportLogs: boolean;
  canManageEvents: boolean;
  canManageProjects: boolean;
  isLeader: boolean;
}

interface PositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPosition: PositionData | null;
  onSuccess: () => void;
}

export function PositionDialog({ isOpen, onOpenChange, editingPosition, onSuccess }: PositionDialogProps) {
  const { token } = useAuth();

  // Form states
  const [posName, setPosName] = useState('');
  const [posLabel, setPosLabel] = useState('');
  const [posColor, setPosColor] = useState('');
  const [posCanManageSettings, setPosCanManageSettings] = useState(false);
  const [posCanExportLogs, setPosCanExportLogs] = useState(false);
  const [posIsLeader, setPosIsLeader] = useState(false);

  // Sync form states when editingPosition changes
  useEffect(() => {
    if (editingPosition) {
      setPosName(editingPosition.name);
      setPosLabel(editingPosition.label);
      setPosColor(mapTailwindClassToHex(editingPosition.color));
      setPosCanManageSettings(editingPosition.canManageSettings);
      setPosCanExportLogs(editingPosition.canExportLogs);
      setPosIsLeader(editingPosition.isLeader);
    } else {
      setPosName('');
      setPosLabel('');
      setPosColor('#64748b');
      setPosCanManageSettings(false);
      setPosCanExportLogs(false);
      setPosIsLeader(false);
    }
  }, [editingPosition, isOpen]);

  const handleSavePosition = async () => {
    if (!posName || !posLabel || !posColor) {
      toast.error('Minden mező kitöltése kötelező!');
      return;
    }

    const payload = {
      name: posName,
      label: posLabel,
      color: posColor,
      canManageSettings: posIsLeader ? true : posCanManageSettings,
      canExportLogs: posIsLeader ? true : posCanExportLogs,
      canManageEvents: posIsLeader,
      canManageProjects: posIsLeader,
      isLeader: posIsLeader,
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      let res;
      if (editingPosition) {
        // Update
        res = await fetch(`/api/positions/${editingPosition.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch('/api/positions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingPosition ? 'Szerepkör sikeresen frissítve!' : 'Szerepkör sikeresen létrehozva!');
        onOpenChange(false);
        onSuccess();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Hiba történt a mentés során');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hálózati hiba történt a mentés során');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full border bg-card/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>{editingPosition ? 'Szerepkör szerkesztése' : 'Új szerepkör létrehozása'}</DialogTitle>
          <DialogDescription>
            Add meg a szerepkör alapvető adatait és engedélyeit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="posName">Azonosító név (uppercase)</Label>
              <Input
                id="posName"
                value={posName}
                onChange={(e) => setPosName(e.target.value.toUpperCase())}
                placeholder="Pl. PR_FELELOS"
                disabled={!!editingPosition}
                className="bg-background font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="posLabel">Megjelenített név</Label>
              <Input
                id="posLabel"
                value={posLabel}
                onChange={(e) => setPosLabel(e.target.value)}
                placeholder="Pl. PR-felelős"
                className="bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Szerepkör színe</Label>
            <div className="flex items-center gap-4 mb-2">
              <ColorPicker value={posColor} onChange={setPosColor} className="flex-1" />
              <div className="flex flex-col gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Előnézet</span>
                <Badge
                  style={{
                    backgroundColor: isHexColor(posColor) ? `${posColor}1a` : undefined,
                    color: isHexColor(posColor) ? posColor : undefined,
                    borderColor: isHexColor(posColor) ? `${posColor}33` : undefined,
                  }}
                  className={cn(
                    "border",
                    !isHexColor(posColor) && (posColor || 'bg-slate-500/10 text-foreground border-slate-500/20')
                  )}
                >
                  {posLabel || 'Szerepkör'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-semibold">Jogosultságok</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="posIsLeader"
                checked={posIsLeader}
                onCheckedChange={(checked) => setPosIsLeader(!!checked)}
                disabled={editingPosition?.isLeader}
              />
              <Label htmlFor="posIsLeader" className="text-sm font-medium cursor-pointer">
                Körvezető (Teljes hozzáférés)
              </Label>
            </div>

            {!posIsLeader && (
              <div className="pl-6 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="posCanManageSettings"
                    checked={posCanManageSettings}
                    onCheckedChange={(checked) => setPosCanManageSettings(!!checked)}
                  />
                  <Label htmlFor="posCanManageSettings" className="text-sm font-normal cursor-pointer">
                    Rendszer arculatának és beállításainak szerkesztése
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="posCanExportLogs"
                    checked={posCanExportLogs}
                    onCheckedChange={(checked) => setPosCanExportLogs(!!checked)}
                  />
                  <Label htmlFor="posCanExportLogs" className="text-sm font-normal cursor-pointer">
                    Munkanaplók CSV exportálása
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Mégse</Button>
          <Button onClick={handleSavePosition}>Szerepkör mentése</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
