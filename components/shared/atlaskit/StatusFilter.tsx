import React, { Dispatch, SetStateAction } from 'react';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { CscOption } from 'types';


interface StatusCscFilterProps {
  options: CscOption[];
  setStatusFilter: Dispatch<SetStateAction<CscOption[] | null>>;
}

const StatusFilter = ({ options, setStatusFilter }: StatusCscFilterProps) => {
  const handleValueChange = (selectedValues: string[]) => {
    const selectedOptions = options.filter((opt) =>
      selectedValues.includes(opt.value.toString())
    );
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
        placeholder="Choose a status"
        animation={0.2}
        maxCount={3}
      />
    </div>
  );
};

export default StatusFilter;
