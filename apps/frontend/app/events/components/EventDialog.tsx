import { Button } from "@/components/ui/button";
import { Calendar22 } from "@/components/ui/datepicker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import React from "react";
import { eventTypeLabels } from "../constants";
import { EventFormData, EventType } from "../types";

// Centralized strings for easier management and future i18n
const DIALOG_TEXT = {
  editTitle: "Edit Event",
  createTitle: "Create New Event",
  nameLabel: "Event Name",
  namePlaceholder: "Enter event name",
  dateLabel: "Date",
  typeLabel: "Event Type",
  typePlaceholder: "Select an event type",
  cancelButton: "Cancel",
  updateButton: "Update Event",
  createButton: "Create Event",
};

interface EventDialogProps {
  isOpen: boolean;
  editingEvent: { id: number; name: string; date: string; type: EventType } | null;
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
  // The Dialog component handles its own visibility, so no need for `if (!isOpen) return null`
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? DIALOG_TEXT.editTitle : DIALOG_TEXT.createTitle}
          </DialogTitle>
        </DialogHeader>
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
            <Calendar22
              id="date"
              required
              value={formData.date}
              popoverClassName="w-64"
              onChange={(value) => onFormDataChange({ ...formData, date: value })}
              disabled={isPending}
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

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {DIALOG_TEXT.cancelButton}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingEvent ? DIALOG_TEXT.updateButton : DIALOG_TEXT.createButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
