import React from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/components/shadcn/lib/utils';

export type CscStatus =
  | 'not_applicable'
  | 'not_performed'
  | 'performed_informally'
  | 'planned'
  | 'well_defined'
  | 'quantitatively_controlled'
  | 'continuously_improving';

const STATUS_CONFIG: Record<
  CscStatus,
  {
    dotColor: string;
    bg: string;
    text: string;
  }
> = {
  not_applicable: {
    dotColor: 'bg-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-200',
  },
  not_performed: {
    dotColor: 'bg-ub-red',
    bg: 'bg-ub-red-bg',
    text: 'text-ub-red-text',
  },
  performed_informally: {
    dotColor: 'bg-ub-amber',
    bg: 'bg-ub-amber-bg',
    text: 'text-ub-amber-text',
  },
  planned: {
    dotColor: 'bg-ub-yellow',
    bg: 'bg-ub-yellow-bg',
    text: 'text-ub-yellow-text',
  },
  well_defined: {
    dotColor: 'bg-ub-blue',
    bg: 'bg-ub-blue-bg',
    text: 'text-ub-blue-text',
  },
  quantitatively_controlled: {
    dotColor: 'bg-ub-purple',
    bg: 'bg-ub-purple-bg',
    text: 'text-ub-purple-text',
  },
  continuously_improving: {
    dotColor: 'bg-ub-green',
    bg: 'bg-ub-green-bg',
    text: 'text-ub-green-text',
  },
};

interface CscStatusBadgeProps {
  status: CscStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function CscStatusBadge({
  status,
  size = 'md',
  className,
}: CscStatusBadgeProps) {
  const { t } = useTranslation('common');
  const config = STATUS_CONFIG[status];

  // Guard against undefined config
  if (!config) {
    console.warn(`Invalid status passed to CscStatusBadge: ${status}`);
    return null;
  }

  const label = t(`statuses.${status.replace(/_/g, '-')}.label`);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-[5px]',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        config.bg,
        config.text,
        className
      )}
      role="status"
      aria-label={label}
    >
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          config.dotColor,
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-[5px] h-[5px]'
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

export const CSC_STATUS_TO_BADGE_KEY: Record<string, CscStatus> = {
  'Not Performed': 'not_performed',
  'Performed Informally': 'performed_informally',
  Planned: 'planned',
  'Well Defined': 'well_defined',
  'Quantitatively Controlled': 'quantitatively_controlled',
  'Continuously Improving': 'continuously_improving',
};
