'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Paintbrush } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const solids = [
  '#f15a29', // Kir-Dev Orange (default)
  '#10b981', // Simonyi Emerald Green
  '#2563eb', // Blue
  '#4f46e5', // Indigo
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#dc2626', // Red
  '#ea580c', // Dark Orange
  '#d97706', // Amber
  '#ca8a04', // Yellow
  '#0d9488', // Teal
  '#0284c7', // Sky Blue
  '#0891b2', // Cyan
  '#16a34a', // Green
  '#9333ea', // Purple
  '#64748b', // Slate
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [background, setBackground] = React.useState(value || '#f15a29');

  React.useEffect(() => {
    if (value) {
      setBackground(value);
    }
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setBackground(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-10 bg-background/50',
            !background && 'text-muted-foreground',
            className
          )}
        >
          <div className="w-full flex items-center gap-2">
            {background ? (
              <div
                className="h-4 w-4 rounded border shrink-0 transition-transform hover:scale-105 shadow-sm"
                style={{ backgroundColor: background }}
              />
            ) : (
              <Paintbrush className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate font-mono text-xs">{background || 'Válassz színt'}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 z-[101] bg-card/95 backdrop-blur-md border shadow-xl p-3">
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold text-muted-foreground">Preset színek</div>
          <div className="grid grid-cols-4 gap-1.5">
            {solids.map((s) => (
              <button
                key={s}
                style={{ backgroundColor: s }}
                className={cn(
                  'h-8 w-full rounded-md border border-border/20 cursor-pointer transition-all hover:scale-105 active:scale-95',
                  background === s ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                )}
                onClick={() => handleColorChange(s)}
                type="button"
              />
            ))}
          </div>

          <div className="border-t pt-3 flex flex-col gap-2">
            <div className="text-xs font-semibold text-muted-foreground">Egyedi szín</div>
            <div className="flex flex-col gap-2">
              <div className="w-full flex justify-center py-1">
                <HexColorPicker
                  color={background}
                  onChange={handleColorChange}
                  className="!w-full !h-32"
                />
              </div>
              <div className="flex gap-2 items-center">
                <div
                  className="h-8 w-8 rounded border shrink-0 shadow-sm"
                  style={{ backgroundColor: background }}
                />
                <Input
                  value={background}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#ffffff"
                  className="h-8 font-mono text-xs bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
