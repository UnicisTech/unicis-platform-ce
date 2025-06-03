import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { cn } from '@/components/shadcn/lib/utils';

const statusOptions = [
  { label: 'Unknown', value: '0' },
  { label: 'Not Applicable', value: '1', className: 'bg-[#B2B2B2] text-white font-bold' },
  { label: 'Not Performed', value: '2', className: 'bg-[#FF0000] text-white font-bold' },
  { label: 'Performed Informally', value: '3', className: 'bg-[#CA003F] text-white font-bold' },
  { label: 'Planned', value: '4', className: 'bg-[#666666] text-white font-bold' },
  { label: 'Well Defined', value: '5', className: 'bg-[#FFBE00] text-white font-bold' },
  { label: 'Quantitatively Controlled', value: '6', className: 'bg-[#6AD900] text-white font-bold' },
  { label: 'Continuously Improving', value: '7', className: 'bg-[#2F8F00] text-white font-bold' },
];

const StatusSelector = ({
  isDisabled,
  statusValue,
  control,
  handler,
}: {
  isDisabled: boolean;
  statusValue: string;
  control: string;
  handler: (control: string, value: string) => Promise<void>;
}) => {
  const [value, setValue] = useState<string>(statusValue);

  useEffect(() => {
    setValue(statusValue);
  }, [statusValue]);

  const handleChange = async (val: string) => {
    const label = statusOptions.find(option => option.value === val)?.label as string;
    setValue(val);
    handler(control, label);
  }

  return (
    <Select value={statusOptions.find((option) => option.label === value)?.value} onValueChange={handleChange} disabled={isDisabled}>
      <SelectTrigger className="w-full h-10">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn('cursor-pointer', option.className)}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;
