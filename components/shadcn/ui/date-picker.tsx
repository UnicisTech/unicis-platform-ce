'use client';

import * as React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/shadcn/ui/popover';
import { Button } from '@/components/shadcn/ui/button';
import { Calendar } from '@/components/shadcn/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/components/shadcn/lib/utils';

export interface DatePickerInputProps {
  /** Value as ISO yyyy-MM-dd */
  value: string;
  /** Called with new value (yyyy-MM-dd) */
  onChange: (value: string) => void;
  /** Placeholder when no value set */
  placeholder?: string;
  /** Optional label to render above the control */
  label?: string;
  /** Validation message to show */
  error?: string;
  isModal?: boolean;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  error,
  isModal,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen} modal={isModal || false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), 'PPP') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              const iso = date ? format(date, 'yyyy-MM-dd') : '';
              onChange(iso);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
