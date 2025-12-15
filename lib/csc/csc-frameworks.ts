import { ISO } from 'types';

export const isoOptions: {
  label: string;
  value: ISO;
}[] = [
  { label: 'ISO/IEC 27001:2013', value: '2013' },
  { label: 'ISO/IEC 27001:2022', value: '2022' },
  { label: 'MVSP v1.0-20211007', value: 'mvps' },
  { label: 'NIST CSF v2', value: 'nistcsfv2' },
  { label: 'EU NIS2', value: 'eunis2' },
  { label: 'GDPR', value: 'gdpr' },
  { label: 'CIS CSC v8.1', value: 'cisv81' },
  { label: 'SOC2 v2', value: 'soc2v2' },
  { label: 'C5 2020', value: 'c5_2020' },
];

export const isoValueToLabel = (value: ISO) =>
  isoOptions.find((option) => option.value === value)?.label;
