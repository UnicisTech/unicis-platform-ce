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

export const ISO_VALUES = [
  'mvsp',
  'iso-2013',
  'iso-2022',
  'nistcsfv2',
  'eunis2',
  'gdpr',
  'cisv81',
  'soc2v2',
  'c5_2020',
  'owasp_asvs_v5',
  'pcidss_v401',
  'iso42001',
] as const;

export type ISO = (typeof ISO_VALUES)[number];

export type CscStatusesProp = `csc_statuses_${ISO}`;

export type CscStatusesMap = Record<string, CscStatus>;

export type CscControlsProp = `csc_controls_${ISO}`;

export type TeamCscProperties = {
  csc_iso?: ISO[];
} & Partial<Record<CscStatusesProp, CscStatusesMap>>;

export type TaskCscProperties = {
  /** @deprecated Read legacy data through the task-properties selectors. */
  csc_controls?: string[];
  csc_audit_logs?: CscAuditLog[];
} & Partial<Record<CscControlsProp, string[]>>;
