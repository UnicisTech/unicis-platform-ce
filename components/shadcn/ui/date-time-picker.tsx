import * as React from 'react';
import { CalendarIcon, Clock3 } from 'lucide-react';

import { cn } from '@/components/shadcn/lib/utils';
import { Button } from '@/components/shadcn/ui/button';
import { Calendar } from '@/components/shadcn/ui/calendar';
import { Input } from '@/components/shadcn/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover';

export interface DateTimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  timeLabel?: string;
  id?: string;
  disabled?: boolean;
  isModal?: boolean;
  className?: string;
  popoverClassName?: string;
}

const padDatePart = (value: number) => String(value).padStart(2, '0');

const parseDateTimeValue = (value: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDateTimeInputValue = (date: Date) =>
  [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-') +
  `T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;

const toTimeInputValue = (date: Date | null) =>
  date
    ? `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
    : '';

const setDatePart = (value: string, date: Date) => {
  const currentDate = parseDateTimeValue(value) ?? new Date();
  const nextDate = new Date(currentDate);

  nextDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

  return toDateTimeInputValue(nextDate);
};

const setTimePart = (value: string, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return value;
  }

  const nextDate = parseDateTimeValue(value) ?? new Date();
  nextDate.setHours(hours, minutes, 0, 0);

  return toDateTimeInputValue(nextDate);
};

const formatDateTime = (value: string) => {
  const date = parseDateTimeValue(value);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const DateTimePickerInput: React.FC<DateTimePickerInputProps> = ({
  value,
  onChange,
  placeholder = 'Pick a date and time',
  timeLabel = 'Time',
  id,
  disabled,
  isModal,
  className,
  popoverClassName,
}) => {
  const [open, setOpen] = React.useState(false);
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const selectedDate = parseDateTimeValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={isModal || false}>
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          variant="outline"
          type="button"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="min-w-0 truncate">
            {selectedDate ? formatDateTime(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        forceMount
        className={cn('w-auto p-0', popoverClassName)}
        align="start"
      >
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={(date) => {
              if (date) {
                onChange(setDatePart(value, date));
              }
            }}
            initialFocus
          />
          <div className="flex items-center gap-2 border-t p-3">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <label
              htmlFor={`${triggerId}-time`}
              className="text-sm font-medium text-muted-foreground"
            >
              {timeLabel}
            </label>
            <Input
              id={`${triggerId}-time`}
              type="time"
              step={60}
              value={toTimeInputValue(selectedDate)}
              onChange={(event) =>
                onChange(setTimePart(value, event.target.value))
              }
              className="ml-auto w-[120px]"
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
