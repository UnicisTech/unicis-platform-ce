import React from 'react';
import { Monitor, Laptop, Apple, Layers, type LucideIcon } from 'lucide-react';
import NumberFormatter from '@/components/shared/NumberFormatter';
import { useTranslation } from 'next-i18next';

export interface AssetProps {
  host: string;
  total: number;
}

export const platformBGs: Record<string, string> = {
  total: 'bg-slate-200 dark:bg-slate-700',
  linux: 'bg-gray-300',
  windows: 'bg-blue-300',
  macos: 'bg-green-300',
};

export const platformIcons: Record<string, LucideIcon> = {
  total: Layers,
  linux: Monitor,
  windows: Laptop,
  macos: Apple,
};

// Map platform keys to display names with proper casing
const getPlatformDisplayName = (platform: string): string => {
  const displayNames: { [key: string]: string } = {
    windows: 'Windows',
    linux: 'Linux',
    macos: 'macOS',
  };
  return (
    displayNames[platform.toLowerCase()] ||
    platform.charAt(0).toUpperCase() + platform.slice(1)
  );
};

const AssetCard = ({ host, total }: AssetProps) => {
  const { t } = useTranslation('fleet');
  const platformKey = host.toLowerCase();
  const isTotal = platformKey === 'total';
  const formattedHost = getPlatformDisplayName(host);
  const Icon = platformIcons[platformKey];
  const bgColor = platformBGs[platformKey] || 'bg-gray-200';
  const label = isTotal
    ? t('total-assets-label', { defaultValue: 'Total Assets' })
    : t('fleet-hosts-count', { count: formattedHost });

  return (
    <div className="flex items-center gap-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5">
      <div
        className={`flex-shrink-0 flex items-center justify-center rounded-full p-2 ${bgColor}`}
      >
        {Icon && <Icon className="h-5 w-5 text-slate-900" aria-hidden />}
      </div>
      <div className="min-w-0">
        <div className="text-lg font-medium leading-none text-slate-900 dark:text-slate-100">
          <NumberFormatter number={total} />
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
          {label}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
