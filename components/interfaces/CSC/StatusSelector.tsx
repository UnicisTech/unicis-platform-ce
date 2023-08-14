import React, { useState } from "react";
import Select from "@atlaskit/select";
import { statusOptions, colourStyles } from "@/components/defaultLanding/data/configs/csc";
import { WithoutRing } from "sharedStyles";

const StatusSelector = ({ 
  statusValue, 
  control, 
  handler 
}: {
  statusValue: string;
  control: string;
  handler: (control: string, value: string) => Promise<void>;
}) => {
  const [value, setValue] = useState(statusValue);
  return (
    <WithoutRing>
      <Select
        inputId="single-select-status"
        className="single-select"
        classNamePrefix="react-select"
        options={statusOptions}
        onChange={(selectedStatus) => {
          const label = selectedStatus?.label as string
          setValue(label);
          handler(control, label);
        }}
        styles={colourStyles}
        placeholder="Status"
        value={statusOptions.find((option) => option.label === value)}
      />
    </WithoutRing>
  );
};

export default StatusSelector;
