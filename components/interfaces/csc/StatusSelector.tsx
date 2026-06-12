import React, { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { cn } from '@/components/shadcn/lib/utils';
import { CSC_STATUS_TO_CSS, CSC_STATUSES } from '@/lib/csc/csc-statuses';
import { useTranslation } from 'next-i18next';

const StatusSelector = ({
  isDisabled,
  statusValue,
  control,
  handler,
}: {
  isDisabled: boolean;
  statusValue: string;
  control: string;
  handler: (control: string, value: string) => Promise<string | undefined>;
}) => {
  const [value, setValue] = useState<string>(statusValue);
  const { t } = useTranslation();

  const handleChange = async (val: string) => {
    const prev = value;
    setValue(val);

    try {
      await handler(control, val);
    } catch {
      setValue(prev);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={isDisabled}>
      <SelectTrigger className="w-full h-10">
        <SelectValue placeholder={t('status')} />
      </SelectTrigger>
      <SelectContent>
        {CSC_STATUSES.map((status) => (
          <SelectItem
            key={status}
            value={status}
            className={cn(
              'cursor-pointer font-bold',
              CSC_STATUS_TO_CSS[status]
            )}
          >
            {t(`statuses.${status}.label`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;
