'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { EventCategoryData, EventCategoryDialog } from './EventCategoryDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export function EventCategoriesTab() {
  const { token } = useAuth();

  // Categories states
  const [categories, setCategories] = useState<EventCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategoryData | null>(null);

  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // Fetch event categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/event-categories', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        toast.error('Nem sikerült betölteni a kategóriákat');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hiba történt a kategóriák betöltésekor');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token, fetchCategories]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat: EventCategoryData) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  // Handle Click Delete
  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Handle Confirmed Delete
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/event-categories/${categoryToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('Kategória sikeresen törölve!');
        fetchCategories();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Nem sikerült törölni a kategóriát');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hálózati hiba történt a törlés során');
    } finally {
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Handle Cancel Delete
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Esemény Kategóriák</CardTitle>
          <CardDescription>
            Itt hozhatsz létre, szerkeszthetsz és törölhetsz különböző típusú esemény kategóriákat.
          </CardDescription>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus size={16} /> Új kategória
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Kategóriák betöltése...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="bg-background/50 border hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      style={{
                        backgroundColor: `${cat.color}1a`,
                        color: cat.color,
                        borderColor: `${cat.color}33`,
                      }}
                      className="border"
                    >
                      {cat.label}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(cat)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteClick(cat.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <EventCategoryDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingCategory={editingCategory}
        onSuccess={fetchCategories}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Kategória törlése"
        description="Biztosan törölni szeretnéd ezt a kategóriát? A kategóriához tartozó események esetén a törlés meghiúsul."
      />
    </Card>
  );
}
