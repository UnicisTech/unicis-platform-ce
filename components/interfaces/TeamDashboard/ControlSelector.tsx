import React, { useEffect, useState } from 'react';
import Select from '@atlaskit/select';
import { sections } from '@/components/defaultLanding/data/configs/csc';
import { WithoutRing } from 'sharedStyles';

const ControlSelector = ({
  controlValue,
  handler,
}: {
  controlValue: string;
  handler: (value: string) => Promise<void>;
}) => {
  const [value, setValue] = useState(controlValue);

  useEffect(() => {
    setValue(controlValue);
  }, [controlValue]);

  return (
    <WithoutRing>
      <Select
        inputId="single-select-status"
        className="single-select text-sm"
        classNamePrefix="react-select"
        options={sections}
        onChange={(selectedStatus) => {
          const label = selectedStatus?.label as string;
          setValue(label);
          handler(label);
        }}
        placeholder="Select Control"
        value={sections.find((option) => option.label === value)}
      />
    </WithoutRing>
  );
};

export default ControlSelector;
