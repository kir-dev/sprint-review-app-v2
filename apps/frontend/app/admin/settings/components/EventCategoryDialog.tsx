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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ColorPicker } from '@/components/ui/color-picker';

export interface EventCategoryData {
  id: number;
  name: string;
  label: string;
  color: string;
}

interface EventCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: EventCategoryData | null;
  onSuccess: () => void;
}

export function EventCategoryDialog({
  isOpen,
  onOpenChange,
  editingCategory,
  onSuccess,
}: EventCategoryDialogProps) {
  const { token } = useAuth();

  // Form states
  const [catName, setCatName] = useState('');
  const [catLabel, setCatLabel] = useState('');
  const [catColor, setCatColor] = useState('#64748b');

  // Sync form states when editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      setCatName(editingCategory.name);
      setCatLabel(editingCategory.label);
      setCatColor(editingCategory.color);
    } else {
      setCatName('');
      setCatLabel('');
      setCatColor('#64748b');
    }
  }, [editingCategory, isOpen]);

  const handleSaveCategory = async () => {
    if (!catName || !catLabel || !catColor) {
      toast.error('Minden mező kitöltése kötelező!');
      return;
    }

    const payload = {
      name: catName.toUpperCase(),
      label: catLabel,
      color: catColor,
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      let res;
      if (editingCategory) {
        // Update
        res = await fetch(`/api/event-categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch('/api/event-categories', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(
          editingCategory
            ? 'Kategória sikeresen frissítve!'
            : 'Kategória sikeresen létrehozva!'
        );
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
          <DialogTitle>
            {editingCategory ? 'Kategória szerkesztése' : 'Új kategória létrehozása'}
          </DialogTitle>
          <DialogDescription>
            Add meg az esemény kategória nevét és egyedi arculati színét.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Azonosító név (uppercase)</Label>
              <Input
                id="catName"
                value={catName}
                onChange={(e) => setCatName(e.target.value.toUpperCase())}
                placeholder="Pl. PROJEKT_HET"
                disabled={!!editingCategory}
                className="bg-background font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="catLabel">Megjelenített név</Label>
              <Input
                id="catLabel"
                value={catLabel}
                onChange={(e) => setCatLabel(e.target.value)}
                placeholder="Pl. Projekt Hét"
                className="bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kategória színe</Label>
            <div className="flex items-center gap-4 mb-2">
              <ColorPicker value={catColor} onChange={setCatColor} className="flex-1" />
              <div className="flex flex-col gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Előnézet
                </span>
                <Badge
                  style={{
                    backgroundColor: `${catColor}1a`,
                    color: catColor,
                    borderColor: `${catColor}33`,
                  }}
                  className="border"
                >
                  {catLabel || 'Kategória'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button onClick={handleSaveCategory}>Kategória mentése</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
