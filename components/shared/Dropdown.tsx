import React, { useRef, ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DropdownOption<T> {
  label: string;
  value: T;
}

interface DropdownProps<T> {
  options: DropdownOption<T>[];
  selectedValue: T;
  placeholder?: string;
  onChange: (value: T) => void;
  icon?: ReactNode;
}

const Dropdown = <T,>({ options, selectedValue, placeholder, onChange, icon }: DropdownProps<T>) => {
  const tabRef = useRef<HTMLUListElement | null>(null);

  return (
    <div className="px-4 z-50">
      <div className="dropdown w-full">
        <div
          onClick={() => {
            if (tabRef.current) {
              tabRef.current.style.display = 'block';
            }
          }}
          tabIndex={0}
          className="btn btn-sm btn-outline border border-gray-300 flex items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
        >
          <div>{options.find(option => option.value === selectedValue)?.label || placeholder}</div>
          {<span className="ml-2">{icon || <ChevronDownIcon className="w-5 h-5" />}</span>}
        </div>
        <ul
          ref={tabRef}
          tabIndex={0}
          className="dropdown-content p-2 shadow-md bg-base-100 w-full rounded border px-2"
        >
          {options.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (tabRef.current) {
                  tabRef.current.style.display = 'none';
                }
                onChange(item.value);
              }}
              className="flex cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
            >
              {item.label}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
