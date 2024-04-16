import type { Session } from 'next-auth';

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

export type ISO = 'default' | '2013' | '2022' | 'nistcsfv2';

type CscStatusesPropMap = {
  default: 'csc_statuses';
  2013: 'csc_statuses_2013';
  2022: 'csc_statuses_2022';
  nistcsfv2: 'csc_statuses_nistcsfv2';
};

export type CscStatusesProp = CscStatusesPropMap[ISO];

type CscControlsPropMap = {
  default: 'csc_controls';
  2013: 'csc_controls_2013';
  2022: 'csc_controls_2022';
  nistcsfv2: 'csc_controls_nistcsfv2';
};

export type CscControlsProp = CscControlsPropMap[ISO];

export type TeamCscProperties = {
  csc_iso?: ISO;
} & {
  [key in CscStatusesProp]?: { [key: string]: string };
};

export type TaskCscProperties = {
  csc_controls?: string[];
  csc_audit_logs: CscAuditLog[];
};
