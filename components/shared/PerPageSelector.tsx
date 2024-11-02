import React from 'react';
import Dropdown from './DropDown';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

const perPageOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];

interface PerPageSelectorProps {
  perPage: number;
  setPerPage: React.Dispatch<React.SetStateAction<number>>;
}

const PerPageSelector = ({ perPage, setPerPage }: PerPageSelectorProps) => {
  return (
    <Dropdown
      options={perPageOptions}
      selectedValue={perPage}
      onChange={setPerPage}
      icon={<ChevronUpDownIcon className="w-5 h-5" />} // Passing the icon here
    />
  );
};

export default PerPageSelector;
