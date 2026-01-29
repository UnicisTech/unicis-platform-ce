import React, { Dispatch, SetStateAction } from 'react';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import frameworks from '@/lib/csc/frameworks';
import { ISO } from 'types';
import { useTranslation } from 'next-i18next';

const SectionFilter = ({
  ISO,
  setSectionFilter,
}: {
  ISO: ISO;
  setSectionFilter: Dispatch<SetStateAction<string[] | null>>;
}) => {
  const { t } = useTranslation();
  const options = frameworks[ISO].sections.map((section) => ({
    label: t(`csc/${ISO}:sections.${section.id}.label`),
    value: section.id,
  }));

  return (
    <div className="w-full max-w-xs mx-1">
      <MultiSelect
        options={options}
        onValueChange={setSectionFilter}
        placeholder="Choose a section"
        animation={0.2}
        maxCount={3}
      />
    </div>
  );
};

export default SectionFilter;
