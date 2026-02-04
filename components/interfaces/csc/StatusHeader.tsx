import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover';
import { Info } from 'lucide-react';
import { CSC_STATUSES, CSC_STATUS_TO_CSS } from '@/lib/csc/csc-statuses';
import { useTranslation } from 'next-i18next';

const Table = () => {
  const { t } = useTranslation();
  return (
    <table className="text-sm w-full">
      <thead>
        <tr className="text-left">
          <th className="py-2 px-3">{t('status')}</th>
          <th className="py-2 px-3">{t('meaning')}</th>
        </tr>
      </thead>
      <tbody>
        {CSC_STATUSES.map((status) => (
          <tr key={status} className={`${CSC_STATUS_TO_CSS[status]}`}>
            <td className="py-2 px-3 font-medium">
              {t(`statuses.${status}.label`)}
            </td>
            <td className="py-2 px-3 leading-snug">
              {t(`statuses.${status}.description`)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const StatusHeader = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1">
        <span>{t('status')}</span>
        <PopoverTrigger asChild>
          <div className="w-5 h-5 flex items-center justify-center cursor-pointer">
            <Info className="w-3 h-3" />
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent className="max-w-[450px] w-fit p-3">
        <Table />
      </PopoverContent>
    </Popover>
  );
};

export default StatusHeader;
