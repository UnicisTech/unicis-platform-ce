// This files contains fleet configuration constants / this constants will be fetched from the Fleet API server
// In the future

export const PLATFORMS = [
  { value: 'windows', label: 'Windows' },
  { value: 'linux', label: 'Linux' },
  { value: 'macos', label: 'macOS' },
];

export const defaultLabels = ['Windows', 'Linux', 'macOS'];

export const QUERY_INTERVAL_OPTIONS = [
  { value: 3600, label: '1 hour' },
  { value: 21600, label: '6 hours' },
  { value: 43200, label: '12 hours' },
  { value: 86400, label: '24 hours' },
  { value: 604800, label: '1 week' },
  { value: 2592000, label: '1 month' },
];

export const DEFAULT_QUERY_INTERVAL = 86400;
export const DEFAULT_FLEET_CONFIG_VERSION = '1';
export const DEFAULT_FLEET_CONFIG_SHARD = 1;
export const DEFAULT_FLEET_CONFIG_VALUE = '1';

export const getQueryIntervalOptions = (currentInterval?: number | null) => {
  if (
    !currentInterval ||
    QUERY_INTERVAL_OPTIONS.some(({ value }) => value === currentInterval)
  ) {
    return QUERY_INTERVAL_OPTIONS;
  }

  return [
    {
      value: currentInterval,
      label: `Current: ${currentInterval} seconds`,
    },
    ...QUERY_INTERVAL_OPTIONS,
  ];
};

export const formatQueryInterval = (interval?: number | null) =>
  QUERY_INTERVAL_OPTIONS.find(({ value }) => value === interval)?.label ||
  (interval ? `${interval} seconds` : '');
