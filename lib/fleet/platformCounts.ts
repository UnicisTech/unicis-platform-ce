import { defaultLabels } from '@/lib/fleet/constants';
import type { Node } from '@/types';

// Map technical platform names to user-friendly names
// Note: osquery on macOS always reports 'darwin' as the build_platform (Darwin is the kernel/OS foundation of macOS)
export const normalizePlatformName = (platform: string): string => {
  const normalized = platform.toLowerCase();
  if (normalized === 'darwin') return 'macos';
  return normalized;
};

// Map platform keys to display names with proper casing
export const getPlatformDisplayName = (platform: string): string => {
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

/** Counts active nodes per normalized platform key (windows/linux/macos/...). */
export const computePlatformCounts = (
  nodes: Node[] | undefined
): Record<string, number> =>
  nodes?.reduce((acc: Record<string, number>, node) => {
    const rawPlatform =
      node.node_info?.osquery_info.build_platform?.toLowerCase();
    if (rawPlatform && node.is_active) {
      const platform = normalizePlatformName(rawPlatform);
      acc[platform] = (acc[platform] || 0) + 1;
    }
    return acc;
  }, {}) || {};

export interface PlatformDatum {
  platform: string;
  total: number;
}

/** Always includes Windows/Linux/macOS (even at 0) plus any other observed platform. */
export const buildPlatformsData = (
  platformCounts: Record<string, number>
): PlatformDatum[] => {
  const labels = Array.from(
    new Set([
      ...defaultLabels,
      ...Object.keys(platformCounts).map((key) => getPlatformDisplayName(key)),
    ])
  );
  return labels.map((platform) => ({
    platform: platform.toLowerCase(),
    total: platformCounts[platform.toLowerCase()] || 0,
  }));
};
