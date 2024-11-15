import { platformBGs, platformIcons } from '@/lib/fleet/tools';
import { Icon } from '@iconify/react';

const PlatformBadge = ({ label, value }: { label: string; value: string }) => {
  const IconsString = platformIcons[value];
  const bgColor = platformBGs[value];

  return (
    <div className={`flex items-end ${bgColor}`}>
        {Icon && (
        <Icon className={`h-10 w-10`} icon={`${IconsString}`} />
        )}
        <span className='text-lg'>{label}</span>
    </div>
  );
};

export default PlatformBadge;
