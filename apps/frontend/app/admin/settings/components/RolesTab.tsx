'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Edit2, Plus, Trash2 } from 'lucide-react';
import { PositionData, PositionDialog } from './PositionDialog';
import { cn } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

const isHexColor = (val: string) => /^#[0-9A-F]{6}$/i.test(val);

export function RolesTab() {
  const { token } = useAuth();

  // Positions states
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionData | null>(null);

  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<number | null>(null);

  // Fetch positions
  const fetchPositions = useCallback(async () => {
    setIsLoadingPositions(true);
    try {
      const res = await fetch('/api/positions', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      } else {
        toast.error('Nem sikerült betölteni a szerepköröket');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hiba történt a szerepkörök betöltésekor');
    } finally {
      setIsLoadingPositions(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPositions();
    }
  }, [token, fetchPositions]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingPosition(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (pos: PositionData) => {
    setEditingPosition(pos);
    setIsModalOpen(true);
  };

  // Handle Click Delete
  const handleDeleteClick = (id: number) => {
    setPositionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Handle Confirmed Delete
  const handleDeleteConfirm = async () => {
    if (!positionToDelete) return;

    try {
      const res = await fetch(`/api/positions/${positionToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('Szerepkör sikeresen törölve!');
        fetchPositions();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Nem sikerült törölni a szerepkört');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hálózati hiba történt a törlés során');
    } finally {
      setDeleteConfirmOpen(false);
      setPositionToDelete(null);
    }
  };

  // Handle Cancel Delete
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPositionToDelete(null);
  };

  // Handle Move position order up/down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newPositions = [...positions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Bounds check
    if (targetIndex < 0 || targetIndex >= newPositions.length) return;

    // Swap elements
    const temp = newPositions[index];
    newPositions[index] = newPositions[targetIndex];
    newPositions[targetIndex] = temp;

    // Optimistic UI update
    setPositions(newPositions);

    try {
      const res = await fetch('/api/positions/order', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: newPositions.map((p) => p.id) }),
      });

      if (res.ok) {
        toast.success('Szerepkörök sorrendje sikeresen frissítve!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Nem sikerült elmenteni a sorrendet');
        fetchPositions(); // Revert to database state
      }
    } catch (err) {
      console.error(err);
      toast.error('Hiba történt a sorrend mentésekor');
      fetchPositions(); // Revert to database state
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Szerepkörök és Jogosultságok</CardTitle>
          <CardDescription>
            Kezelheted a kör szerepköreit és hogy azok milyen funkciókhoz férhetnek hozzá.
          </CardDescription>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus size={16} /> Új szerepkör
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingPositions ? (
          <div className="py-8 text-center text-muted-foreground">Szerepkörök betöltése...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {positions.map((pos, index) => (
              <Card key={pos.id} className="bg-background/50 border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: isHexColor(pos.color) ? `${pos.color}1a` : undefined,
                        color: isHexColor(pos.color) ? pos.color : undefined,
                        borderColor: isHexColor(pos.color) ? `${pos.color}33` : undefined,
                      }}
                      className={cn("border", !isHexColor(pos.color) && pos.color)}
                    >
                      {pos.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === positions.length - 1}
                    >
                      <ChevronDown size={16} />
                    </Button>
                    <div className="w-[1px] h-4 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(pos)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteClick(pos.id)}
                      disabled={pos.isLeader}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-xs space-y-2 text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Admin beállítások:</span>
                    <Badge variant={pos.canManageSettings ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                      {pos.canManageSettings ? 'Igen' : 'Nem'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Naplók exportálása:</span>
                    <Badge variant={pos.canExportLogs ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                      {pos.canExportLogs ? 'Igen' : 'Nem'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <PositionDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingPosition={editingPosition}
        onSuccess={fetchPositions}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Szerepkör törlése"
        description="Biztosan törölni szeretnéd ezt a szerepkört? A művelet nem vonható vissza."
      />
    </Card>
  );
}
