import { Controller, Control, FieldValues, Path, ControllerRenderProps } from 'react-hook-form';
import React from 'react';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: { message?: string };
  children: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
  required?: boolean;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  control,
  error,
  children,
  required,
}: FormFieldProps<T>) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => children(field)}
      />
      {error && (
        <p className="text-sm text-destructive animate-fade-in">
          {error.message}
        </p>
      )}
    </div>
  );
}
