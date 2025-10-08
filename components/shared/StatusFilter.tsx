import React from 'react';
import Dropdown from './Dropdown';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface StatusFilterProps {
  value: string;
  options: { label: string; value: string }[];
  handler: React.Dispatch<React.SetStateAction<string>>;
}

const StatusFilter = ({ options, value, handler }: StatusFilterProps) => {
  return (
    <Dropdown
      options={options}
      selectedValue={value}
      onChange={handler}
      icon={<ChevronDownIcon className="w-3 h-5" />}
      placeholder="Choose a status..."
    />
  );
};

export default StatusFilter;
