import React from 'react'
import NumberFormatter from '@/components/shared/NumberFormatter';
// import { Icon } from '@iconify/react';
import { platformIcons } from '@/lib/fleet/tools';


export interface AssetProps {
  host: string;
  total: number;
}

export const platformBGs = {
  linux: 'bg-gray-300',
  windows: 'bg-blue-300',
  macos: 'bg-green-300',
};

// Map platform keys to display names with proper casing
const getPlatformDisplayName = (platform: string): string => {
  const displayNames: { [key: string]: string } = {
    'windows': 'Windows',
    'linux': 'Linux',
    'macos': 'macOS',
  };
  return displayNames[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1);
};

const AssetCard = ({ host, total } : AssetProps) => {
  const iconString = platformIcons[host];
  const bgColor = platformBGs[host];

  const formattedHost = getPlatformDisplayName(host);

  return (
    <div className="grid grid-cols-2 w-full rounded-sm p-4 ring-1 ring-gray-300 items-center justify-between">
      <div className={`w-fit flex items-center justify-center rounded-full p-1 ring-gray-300 ring-1`}>
        {/* <Icon className='h-[72px] w-[72px]' icon={`${iconString}`} /> */}
      </div>
      <div className='flex-1 justify-between'>
        <NumberFormatter number={total} />
        <h1 className='text-lg'>{formattedHost} hosts</h1>
      </div>
    </div>
  )
}

export default AssetCard