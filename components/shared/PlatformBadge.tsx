import { Badge as BaseBadge } from 'react-daisyui';
import LinuxIcon from '@/public/icons/linux.svg';
import WindowsIcon from '@/public/icons/windows-7.svg';
import MacIcon from '@/public/icons/os-apple.svg';
import FreeBSDIcon from '@/public/icons/freebsd-outlined.svg';
import PosixIcon from '@/public/icons/pc.svg';
import AllPlatformsIcon from '@/public/icons/pc.svg';
import Image from 'next/image';


const colors = {
  linux: 'ghost',
  windows: 'secondary',
  darwin: 'primary',
  freebsd: 'info',
  posix: 'success',
  all: 'accent',
};

const platformIcons = {
  linux: LinuxIcon,
  windows: WindowsIcon,
  darwin: MacIcon,
  freebsd: FreeBSDIcon,
  posix: PosixIcon,
  all: AllPlatformsIcon,
};

const PlatformBadge = ({ label, value }: { label: string; value: string }) => {
  const Icon = platformIcons[value];

  return (
    <>
      <BaseBadge
        className={`rounded text-xs whitespace-nowrap flex items-center`}
        // color={colors[value]}
      >
        {Icon && (
          <div className='h-4 w-4 mr-2'>
            <Image
              src={Icon}
              alt={`${value} icon`}
              width={16}
              layout='fixed'
              height={16}
            />
          </div>
        )}
        {label}
      </BaseBadge>
    </>
  );
};

export default PlatformBadge;
