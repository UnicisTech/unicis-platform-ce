import React, { Dispatch, SetStateAction } from 'react';
import Select from '@atlaskit/select';
import { getSectionFilterOptions } from '@/components/defaultLanding/data/configs/csc';
import { WithoutRing } from 'sharedStyles';

const SectionFilter = ({
  ISO,
  setSectionFilter,
}: {
  ISO: string;
  setSectionFilter: Dispatch<
    SetStateAction<{ label: string; value: string }[] | null>
  >;
}) => {
  return (
    <div style={{ margin: '0 5px' }}>
      <WithoutRing>
        <Select
          inputId="multi-select-section-filter"
          className="multi-select"
          classNamePrefix="react-select"
          options={getSectionFilterOptions(ISO)}
          onChange={(value) => {
            setSectionFilter([...value]);
          }}
          placeholder="Choose a section"
          isMulti
        />
      </WithoutRing>
    </div>
  );
};

export default SectionFilter;
