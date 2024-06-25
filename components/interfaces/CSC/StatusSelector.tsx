import React, { useEffect, useState } from 'react';
import Select from '@atlaskit/select';
import {
  statusOptions,
  colourStyles,
} from '@/components/defaultLanding/data/configs/csc';
import { WithoutRing } from 'sharedStyles';

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
  const [value, setValue] = useState(statusValue);

  useEffect(() => {
    setValue(statusValue);
  }, [statusValue]);

  return (
    <WithoutRing>
      <Select
        inputId="single-select-status"
        className="single-select"
        classNamePrefix="react-select"
        options={statusOptions}
        onChange={(selectedStatus) => {
          const label = selectedStatus?.label as string;
          setValue(label);
          handler(control, label);
        }}
        styles={colourStyles}
        placeholder="Status"
        value={statusOptions.find((option) => option.label === value)}
        isDisabled={isDisabled}
      />
    </WithoutRing>
  );
};

export default StatusSelector;
