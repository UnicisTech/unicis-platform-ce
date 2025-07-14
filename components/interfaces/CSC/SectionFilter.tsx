import React, { Dispatch, SetStateAction } from 'react';
import { getSectionFilterOptions } from '@/components/defaultLanding/data/configs/csc';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';

interface Option {
  label: string;
  value: string;
}

const SectionFilter = ({
  ISO,
  setSectionFilter,
}: {
  ISO: string;
  setSectionFilter: Dispatch<SetStateAction<Option[] | null>>;
}) => {
  const options = getSectionFilterOptions(ISO);

  const handleValueChange = (selectedValues: string[]) => {
    const selectedOptions = options.filter((opt) =>
      selectedValues.includes(opt.value)
    );
    setSectionFilter(selectedOptions);
  };

  return (
    <div className="w-full max-w-xs mx-1">
      <MultiSelect
        options={options}
        onValueChange={handleValueChange}
        placeholder="Choose a section"
        animation={0.2}
        maxCount={3}
      />
    </div>
  );
};

export default SectionFilter;
