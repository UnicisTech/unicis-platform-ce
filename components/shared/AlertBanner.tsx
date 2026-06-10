import React from 'react';
import { Info, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/components/shadcn/lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const variantConfig: Record<
  AlertVariant,
  {
    bg: string;
    border: string;
    text: string;
    Icon: typeof Info;
  }
> = {
  info: {
    bg: 'bg-ub-blue-bg',
    border: 'border-ub-blue-border',
    text: 'text-ub-blue-text',
    Icon: Info,
  },
  success: {
    bg: 'bg-ub-green-bg',
    border: 'border-ub-green-border',
    text: 'text-ub-green-text',
    Icon: CheckCircle,
  },
  warning: {
    bg: 'bg-ub-amber-bg',
    border: 'border-ub-amber-border',
    text: 'text-ub-amber-text',
    Icon: AlertTriangle,
  },
  danger: {
    bg: 'bg-ub-red-bg',
    border: 'border-ub-red-border',
    text: 'text-ub-red-text',
    Icon: ShieldAlert,
  },
};

export interface AlertBannerProps {
  variant: AlertVariant;
  title: string;
  description?: string;
  className?: string;
}

export function AlertBanner({
  variant,
  title,
  description,
  className,
}: AlertBannerProps) {
  const { bg, border, text, Icon } = variantConfig[variant];
  return (
    <div
      className={cn(
        'flex gap-2.5 items-start rounded-lg border px-3 py-2.5 text-[13px]',
        bg,
        border,
        text,
        className
      )}
    >
      <Icon size={15} className="flex-shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-medium leading-snug">{title}</p>
        {description && (
          <p className="mt-0.5 opacity-80 text-[12px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
