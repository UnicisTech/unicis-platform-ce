import React from 'react';
import { Monitor, Laptop, Apple, type LucideIcon } from 'lucide-react';
import NumberFormatter from '@/components/shared/NumberFormatter';
import { useTranslation } from 'next-i18next';

export interface AssetProps {
  host: string;
  total: number;
}

export const platformBGs: Record<string, string> = {
  linux: 'bg-gray-300',
  windows: 'bg-blue-300',
  macos: 'bg-green-300',
};

export const platformIcons: Record<string, LucideIcon> = {
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
  const formattedHost = getPlatformDisplayName(host);
  const platformKey = host.toLowerCase();
  const Icon = platformIcons[platformKey];
  const bgColor = platformBGs[platformKey] || 'bg-gray-200';

  return (
    <div className="grid grid-cols-2 w-full rounded-sm p-4 ring-1 ring-gray-300 items-center justify-between">
      <div
        className={`w-fit flex items-center justify-center rounded-full p-3 ${bgColor}`}
      >
        {Icon && (
          <Icon className="h-9 w-9 text-gray-900 dark:text-gray-900" />
        )}
      </div>
      <div className="flex-1 justify-between">
        <NumberFormatter number={total} />
        <h1 className="text-lg">
          {t('fleet-hosts-count', { count: formattedHost })}
        </h1>
      </div>
    </div>
  );
};

export default AssetCard;
