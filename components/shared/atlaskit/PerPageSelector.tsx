import React, { Dispatch, SetStateAction } from 'react';
import Select from '@atlaskit/select';
import { WithoutRing } from 'sharedStyles';

interface Option {
  label: string;
  value: number;
}

const PerPageSelector = ({
  setPerPage,
  options,
  placeholder,
  defaultValue,
}: {
  setPerPage: Dispatch<SetStateAction<number>>;
  options: Array<Option>;
  placeholder?: string;
  defaultValue: Option;
}) => {
  return (
    <div style={{ margin: '0 5px' }}>
      <WithoutRing>
        <Select
          inputId="single-select-status-per-page"
          className="single-select"
          classNamePrefix="react-select"
          options={options}
          onChange={(option) => {
            const value = option?.value as number;
            setPerPage(value);
          }}
          defaultValue={defaultValue || ''}
          placeholder={placeholder}
        />
      </WithoutRing>
    </div>
  );
};

export default PerPageSelector;
