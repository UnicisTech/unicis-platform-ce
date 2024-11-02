import React, { Dispatch, SetStateAction } from 'react';
import Select from '@atlaskit/select';
// import { statusOptions } from '@/components/defaultLanding/data/configs/csc';
import { WithoutRing } from 'sharedStyles';

interface StatusCscFilterProps<T> {
  options: T[]
  setStatusFilter: Dispatch<SetStateAction<T[] | null>>;
}

const StatusFilter = <T,>({
  options,
  setStatusFilter,
}: StatusCscFilterProps<T>) => {
  return (
    <div style={{ margin: '0 5px' }}>
      <WithoutRing>
        <Select
          inputId="multi-select-status-filter"
          className="multi-select"
          classNamePrefix="react-select"
          options={options}
          onChange={(value) => {
            setStatusFilter([...value]);
          }}
          placeholder="Choose a status"
          isMulti
        />
      </WithoutRing>
    </div>
  );
};

export default StatusFilter;
