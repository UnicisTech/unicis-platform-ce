import type { ISO, CscControlsProp, CscStatusesProp } from 'types';

export const getCscControlsProp = (ISO: ISO): CscControlsProp =>
  `csc_controls_${ISO}`;

export const getCscStatusesProp = (ISO: ISO): CscStatusesProp =>
  `csc_statuses_${ISO}`;

export const cscNavigations = (activeTab: ISO, iso: ISO[]) => {
  return iso.map((item) => ({
    name: item || 'Not found',
    active: activeTab === item,
  }));
};
