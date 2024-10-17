import Image from 'next/image'
import React from 'react'
import LinuxIcon from '@/public/icons/linux.svg';
import WindowsIcon from '@/public/icons/windows-7.svg';
import MacIcon from '@/public/icons/apple.svg';
import FreeBSDIcon from '@/public/icons/freebsd-outlined.svg';
import PosixIcon from '@/public/icons/linux-ubuntu.svg';
import AllPlatformsIcon from '@/public/icons/pc.svg';
import NumberFormatter from '@/components/shared/NumberFormatter';

const platformIcons = {
  linux: LinuxIcon,
  windows: WindowsIcon,
  darwin: MacIcon,
  freebsd: FreeBSDIcon,
  posix: PosixIcon,
  all: AllPlatformsIcon,
};

const platformBGs = {
  linux: 'bg-green-500',
  windows: 'bg-blue-500',
  darwin: 'bg-gray-500',
  freebsd: 'bg-red-500',
  posix: 'bg-purple-500',
  all: 'bg-yellow-500',
};

export interface AssetProps {
  host: string;
  total: number;
}

const AssetCard = ({ host, total } : AssetProps) => {
  const Icon = platformIcons[host];
  const BgColor = platformBGs[host];

  // Convert the first letter of the host to uppercase
  const formattedHost = host.charAt(0).toUpperCase() + host.slice(1);

  return (
    <div className="rounded-md bg-neutral text-neutral-content">
      <div className="card-body items-center text-center">
        <div className={`mb-4 rounded-full p-2 ${BgColor} flex justify-center items-center`}>
          <Image
            src={Icon}
            alt={`${host} icon`}
            width={50}
            height={50}
          />
        </div>
        <NumberFormatter number={total} />
        <h1>{formattedHost} hosts</h1>
      </div>
    </div>
  )
}

export default AssetCard