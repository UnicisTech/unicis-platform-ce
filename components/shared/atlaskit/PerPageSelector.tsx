import React, { Dispatch, SetStateAction } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { Label } from '@/components/shadcn/ui/label';

interface Option {
  label: string;
  value: number;
}

const PerPageSelector = ({
  setPerPage,
  options,
  placeholder = 'Select',
  defaultValue,
}: {
  setPerPage: Dispatch<SetStateAction<number>>;
  options: Option[];
  placeholder?: string;
  defaultValue: Option;
}) => {
  return (
    <div className="w-full max-w-[150px] mx-1">
      <Label htmlFor="per-page-select" className="sr-only">Per Page</Label>
      <Select
        defaultValue={String(defaultValue.value)}
        onValueChange={(val) => setPerPage(Number(val))}
      >
        <SelectTrigger id="per-page-select" className="w-full h-10 px-3">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PerPageSelector;
