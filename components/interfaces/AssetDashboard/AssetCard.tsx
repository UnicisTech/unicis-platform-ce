import React from 'react'
import NumberFormatter from '@/components/shared/NumberFormatter';
import { Icon } from '@iconify/react';

const platformIcons = {
  linux: "uim:linux",
  windows: "uim:windows",
  apple: "uim:apple",
};

const platformBGs = {
  linux: 'bg-gray-300',
  windows: 'bg-blue-300',
  apple: 'bg-green-300',
};

export interface AssetProps {
  host: string;
  total: number;
}

const AssetCard = ({ host, total } : AssetProps) => {
  const iconString = platformIcons[host];
  const bgColor = platformBGs[host];

  // Convert the first letter of the host to uppercase
  const formattedHost = host.charAt(0).toUpperCase() + host.slice(1);

  return (
    <div className="grid grid-cols-2 w-full rounded-sm p-4 ring-1 ring-gray-300 items-center justify-between">
      <div className={`w-fit flex items-center justify-center rounded-full ${bgColor} p-1 ring-gray-300 ring-1`}>
        <Icon className='h-16 w-16' icon={`${iconString}`} />
      </div>
      <div className='flex-1 justify-between'>
        <NumberFormatter number={total} />
        <h1 className='text-lg'>{formattedHost} hosts</h1>
      </div>
    </div>
  )
}

export default AssetCard