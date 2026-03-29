import { ISO } from 'types';

export const CSC_FRAMEWORK_TO_NAME: Record<ISO, string> = {
  '2013': 'ISO/IEC 27001:2013',
  '2022': 'ISO/IEC 27001:2022',
  mvps: 'MVSP v1.0-20211007',
  nistcsfv2: 'NIST CSF v2',
  eunis2: 'EU NIS2',
  gdpr: 'GDPR',
  cisv81: 'CIS CSC v8.1',
  soc2v2: 'SOC2 v2',
  c5_2020: 'C5 2020',
  owasp_asvs_v5: 'OWASP ASVS v5',
  pcidss_v401: 'PCI DSS v4.0.1',
  iso42001: 'ISO/IEC 42001:2023',
};

export const isoOptions: {
  label: string;
  value: ISO;
}[] = Object.entries(CSC_FRAMEWORK_TO_NAME).map(([value, label]) => ({
  label,
  value: value as ISO,
}));

export const CSC_FRAMEWORK_TO_SHORTNAME: Record<ISO, string> = {
  mvps: 'MVSP',
  '2013': 'ISO 2013',
  '2022': 'ISO 2022',
  nistcsfv2: 'NIST',
  eunis2: 'NIS2',
  gdpr: 'GDPR',
  cisv81: 'CIS',
  soc2v2: 'SOC2',
  c5_2020: 'C5',
  owasp_asvs_v5: 'ASVS',
  pcidss_v401: 'PCI DSS',
  iso42001: 'AIMS',
};

export const isoValueToLabel = (value: ISO) => CSC_FRAMEWORK_TO_NAME[value];
