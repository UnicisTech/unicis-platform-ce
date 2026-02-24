import { CscStatus } from '@/lib/csc/csc-statuses';
import type { Session } from 'next-auth';

export interface FrameworkSection {
  id: string;
}

export interface FrameworkControl {
  id: string;
  sectionId: string;
}

export interface FrameworkData {
  sections: FrameworkSection[];
  controls: FrameworkControl[];
}

// TODO: replace this type
export type CscOption = {
  label: string;
  value: number;
};

export type CscAuditLog = {
  actor: Session['user'];
  date: number;
  event: string;
  diff: {
    prevValue: string | null;
    nextValue: string;
  };
};

export type ControlOption = {
  label: string;
  value: {
    code: string;
    control: string;
    controlLabel?: string;
    requirements: string;
    section: string;
  };
};

export type Control = {
  Code: string;
  Section: string;
  Control: string;
  Requirements: string;
  Status: string;
};

export type IsoControlMap = Record<string, Control[]>;

export type Section = {
  label: string;
  value: string;
};

export type ISO =
  | 'mvps'
  | '2013'
  | '2022'
  | 'nistcsfv2'
  | 'eunis2'
  | 'gdpr'
  | 'cisv81'
  | 'soc2v2'
  | 'c5_2020'
  | 'owasp_asvs_v5';

// TODO: use getControlPropsName function with config and ISO type to generate type
type CscStatusesPropMap = {
  mvps: 'csc_statuses_mvps';
  2013: 'csc_statuses_2013';
  2022: 'csc_statuses_2022';
  nistcsfv2: 'csc_statuses_nistcsfv2';
  eunis2: 'csc_statuses_eunis2';
  gdpr: 'csc_statuses_gdpr';
  cisv81: 'csc_statuses_cisv81';
  soc2v2: 'csc_statuses_soc2v2';
  c5_2020: 'csc_statuses_c5_2020';
  owasp_asvs_v5: 'csc_statuses_owasp_asvs_v5';
};

export type CscStatusesProp = CscStatusesPropMap[ISO];

export type CscStatusesMap = Record<string, CscStatus>;

// TODO: use getControlPropsName function with config and ISO type to generate type
type CscControlsPropMap = {
  mvps: 'csc_controls_mvps';
  2013: 'csc_controls_2013';
  2022: 'csc_controls_2022';
  nistcsfv2: 'csc_controls_nistcsfv2';
  eunis2: 'csc_controls_eunis2';
  gdpr: 'csc_controls_gdpr';
  cisv81: 'csc_controls_cisv81';
  soc2v2: 'csc_controls_soc2v2';
  c5_2020: 'csc_controls_c5_2020';
  owasp_asvs_v5: 'csc_controls_owasp_asvs_v5';
};

export type CscControlsProp = CscControlsPropMap[ISO];

export type TeamCscProperties = {
  csc_iso?: ISO[];
} & {
  [key in CscStatusesProp]?: { [key: string]: string };
};

export type TaskCscProperties = {
  csc_controls?: string[];
  csc_audit_logs: CscAuditLog[];
};
