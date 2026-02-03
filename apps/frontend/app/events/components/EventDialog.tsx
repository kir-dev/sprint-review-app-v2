import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/daterangepicker";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, X } from "lucide-react";
import React from "react";
import { DateRange } from "react-day-picker";
import { eventTypeLabels } from "../constants";
import { EventFormData, EventType } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Centralized strings for easier management and future i18n
const DIALOG_TEXT = {
  editTitle: "Esemény Szerkesztése",
  createTitle: "Új Esemény Létrehozása",
  nameLabel: "Esemény Neve",
  namePlaceholder: "Add meg az esemény nevét",
  dateLabel: "Dátum",
  typeLabel: "Esemény Típus",
  typePlaceholder: "Válassz esemény típust",
  cancelButton: "Mégse",
  updateButton: "Esemény Frissítése",
  createButton: "Esemény Létrehozása",
};

interface EventDialogProps {
  isOpen: boolean;
  editingEvent: { id: number; name: string; startDate: string; endDate: string; type: EventType } | null;
  formData: EventFormData;
  isPending: boolean;
  onFormDataChange: (data: EventFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function EventDialog({
  isOpen,
  editingEvent,
  formData,
  isPending,
  onFormDataChange,
  onSubmit,
  onClose,
}: EventDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto my-8 animate-slide-in-bottom">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {editingEvent ? DIALOG_TEXT.editTitle : DIALOG_TEXT.createTitle}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 transition-all hover:scale-110"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                {DIALOG_TEXT.nameLabel} <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder={DIALOG_TEXT.namePlaceholder}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium">
                {DIALOG_TEXT.dateLabel} <span className="text-destructive">*</span>
              </label>
              <DateRangePicker
                className="w-full"
                date={{
                  from: formData.startDate ? new Date(`${formData.startDate}T00:00:00`) : undefined,
                  to: formData.endDate ? new Date(`${formData.endDate}T00:00:00`) : undefined,
                }}
                onDateChange={(range: DateRange | undefined) => {
                  onFormDataChange({
                    ...formData,
                    startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
                    endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium">
                {DIALOG_TEXT.typeLabel} <span className="text-destructive">*</span>
              </label>
              <Select
                required
                value={formData.type}
                onValueChange={(value) => onFormDataChange({ ...formData, type: value as EventType })}
                disabled={isPending}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder={DIALOG_TEXT.typePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {eventTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                disabled={isPending}
                onClick={onClose}
                className="transition-all hover:scale-105 order-2 sm:order-1"
              >
                {DIALOG_TEXT.cancelButton}
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="transition-all hover:scale-105 order-1 sm:order-2"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEvent ? DIALOG_TEXT.updateButton : DIALOG_TEXT.createButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
