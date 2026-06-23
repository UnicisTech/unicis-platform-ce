import React from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/components/shadcn/lib/utils';

interface AssetStatusBadgeProps {
  isActive: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const AssetStatusBadge = ({
  isActive,
  size = 'sm',
  className,
}: AssetStatusBadgeProps) => {
  const { t } = useTranslation('common');
  const label = t(isActive ? 'active' : 'inactive');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-[5px]',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        isActive
          ? 'bg-ub-green-bg text-ub-green-text'
          : 'bg-ub-red-bg text-ub-red-text',
        className
      )}
      role="status"
      aria-label={label}
    >
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          isActive ? 'bg-ub-green' : 'bg-ub-red',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-[5px] h-[5px]'
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
};

export default AssetStatusBadge;
