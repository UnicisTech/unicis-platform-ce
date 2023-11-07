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
