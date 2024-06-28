import React, { useRef, Dispatch, SetStateAction } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

const perPageOptions: { label: string; value: number }[] = [
  {
    label: '5',
    value: 5,
  },
  {
    label: '10',
    value: 10,
  },
  {
    label: '25',
    value: 25,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];

interface PerPageSelectorProps {
  perPage: number;
  setPerPage: Dispatch<SetStateAction<number>>;
}

const PerPageSelector = ({ perPage, setPerPage }: PerPageSelectorProps) => {
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
          <div>{perPage}</div>
          <ChevronUpDownIcon className="w-5 h-5" />
        </div>
        <ul
          ref={tabRef}
          tabIndex={0}
          className="dropdown-content p-2 shadow-md bg-base-100 w-full rounded border px-2"
        >
          {perPageOptions.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (tabRef.current) {
                  tabRef.current.style.display = 'none';
                }
                setPerPage(item.value);
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

export default PerPageSelector;
