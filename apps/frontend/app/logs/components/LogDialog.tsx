import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar22 } from '@/components/ui/datepicker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { categoryLabels } from '../constants';
import { logFormSchema } from '../form-schema';
import { Event, Log, LogFormData, Project, WorkPeriod } from '../types';
import { findWorkPeriodForDate } from '../utils/log-helpers';
import { CategorySpecificFields } from './CategorySpecificFields';
import { FormField } from './FormField';

interface LogDialogProps {
  isOpen: boolean;
  editingLog: Log | null;
  formData: LogFormData;
  projects: Project[];
  events: Event[];
  workPeriods: WorkPeriod[];
  onSubmit: (data: LogFormData) => void;
  onClose: () => void;
}

export function LogDialog({
  isOpen,
  editingLog,
  formData,
  projects,
  events,
  workPeriods,
  onClose,
  onSubmit,
}: LogDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<LogFormData>({
    resolver: zodResolver(logFormSchema as any) as any,
    defaultValues: formData,
  });

  const category = watch('category');
  const description = watch('description');

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  useEffect(() => {
    const date = watch('date');
    const matchingPeriod = findWorkPeriodForDate(date, workPeriods);
    if (matchingPeriod) {
      setValue('workPeriodId', matchingPeriod.id.toString());
    } else {
      setValue('workPeriodId', '');
    }
  }, [watch, workPeriods, setValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-slide-in-bottom">
        <CardHeader>
          <CardTitle>
            {editingLog ? 'Napló Szerkesztése' : 'Új Napló Létrehozása'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="date"
                label="Dátum"
                control={control}
                error={errors.date}
                required
              >
                {(field) => (
                  <Calendar22
                    id="date"
                    value={
                      (field.value as any) instanceof Date
                        ? new Date(
                            ((field.value as any) as Date).getTime() -
                              ((field.value as any) as Date).getTimezoneOffset() *
                                60000,
                          )
                            .toISOString()
                            .slice(0, 10)
                        : field.value
                    }
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="w-full"
                    required
                  />
                )}
              </FormField>

              <FormField
                name="category"
                label="Kategória"
                control={control}
                error={errors.category}
                required
              >
                {(field) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      className={errors.category ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Válassz kategóriát" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <CategorySpecificFields
                category={category}
                control={control}
                errors={errors}
                projects={projects}
                events={events}
              />

              <FormField
                name="timeSpent"
                label="Eltöltött idő (óra)"
                control={control}
                error={errors.timeSpent}
              >
                {(field) => (
                  <input
                    id="timeSpent"
                    type="number"
                    min="0"
                    max="24"
                    step="0.1"
                    {...field}
                    className={`flex h-10 w-full rounded-md border ${errors.timeSpent ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                    placeholder="pl. 2.5"
                  />
                )}
              </FormField>
            </div>

            <FormField
              name="description"
              label="Leírás"
              control={control}
              error={errors.description}
              required
            >
              {(field) => (
                <>
                  <Textarea
                    id="description"
                    rows={4}
                    {...field}
                    className={errors.description ? 'border-destructive' : ''}
                    placeholder={`Írd le, mit csináltál...`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description?.length || 0}/500 karakter
                  </p>
                </>
              )}
            </FormField>

            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md animate-fade-in">
                <p className="text-sm text-destructive font-medium">
                  Kérlek javítsd a hibákat a form elküldése előtt!
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="transition-all hover:scale-105"
              >
                Mégse
              </Button>
              <Button type="submit" className="transition-all hover:scale-105">
                {editingLog ? 'Módosítás' : 'Létrehozás'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
