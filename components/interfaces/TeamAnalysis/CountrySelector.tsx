import React, { useEffect, useState } from 'react';
import Select from '@atlaskit/select';
import { config } from '@/components/defaultLanding/data/configs/rpa';
import { WithoutRing } from 'sharedStyles';

const CountrySelector = ({
  countryValue,
  handler,
}: {
  countryValue: string;
  handler: (value: string) => Promise<void>;
}) => {
  const [value, setValue] = useState(countryValue);

  useEffect(() => {
    setValue(countryValue);
  }, [countryValue]);

  return (
    <WithoutRing>
      <Select
        inputId="single-select-status"
        className="single-select text-sm"
        classNamePrefix="react-select"
        options={config.country}
        onChange={(selectedStatus) => {
          const label = selectedStatus?.label as string;
          setValue(label);
          handler(label);
        }}
        // styles={colourStyles}
        placeholder="Total Per Country"
        value={config.country.find((option) => option.label === value)}
      />
    </WithoutRing>
  );
};

export default CountrySelector;
