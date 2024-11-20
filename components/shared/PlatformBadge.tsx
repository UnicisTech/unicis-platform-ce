import { platformIcons } from '@/lib/fleet/tools';
import { Icon } from '@iconify/react';

export const platformBGs = {
  linux: 'bg-gray-300',
  windows: 'bg-blue-300',
  apple: 'bg-green-300',
};

const PlatformBadge = ({ label, value }: { label: string; value: string }) => {
  const IconsString = platformIcons[value];
  const bgColor = platformBGs[value];

  return (
    <div className={`flex items-end gap-2`}>
        {Icon && (
        <Icon className={`h-8 w-8 rounded-full`} icon={`${IconsString}`} />
        )}
        <span className='text-lg'>{label}</span>
    </div>
  );
};

export default PlatformBadge;
