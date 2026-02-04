import React, { Dispatch, SetStateAction } from 'react';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { CSC_STATUSES, CscStatus } from '@/lib/csc/csc-statuses';
import { useTranslation } from 'next-i18next';

interface StatusCscFilterProps {
  setStatusFilter: Dispatch<SetStateAction<CscStatus[] | null>>;
}

const StatusFilter = ({ setStatusFilter }: StatusCscFilterProps) => {
  const { t } = useTranslation('common');
  const options = CSC_STATUSES.map((status) => ({
    label: t(`statuses.${status}.label`),
    value: status,
  }));
  const handleValueChange = (selectedValues: string[]) => {
    const selectedOptions = options
      .filter((opt) => selectedValues.includes(opt.value.toString()))
      .map((option) => option.value);
    setStatusFilter(selectedOptions);
  };

  return (
    <div className="w-full max-w-xs mx-1">
      <MultiSelect
        options={options.map((opt) => ({
          ...opt,
          value: String(opt.value),
        }))}
        onValueChange={handleValueChange}
        placeholder={t('choose-a-status')}
        animation={0.2}
        maxCount={3}
      />
    </div>
  );
};

export default StatusFilter;
