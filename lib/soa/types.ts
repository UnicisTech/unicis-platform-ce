import type { ISO } from 'types';
import type { CscStatus } from '@/lib/csc/csc-statuses';

export interface SoaRow {
  code:         string;
  section:      string;
  control:      string;
  requirements: string;
  // status code (one of the CscStatus values) — used for colouring/counts
  status:       CscStatus | 'unknown';
  // human readable, localized label for the status (resolved in the component)
  statusLabel:  string;
  // human readable, localized meaning/description for the status
  meaning?:     string;
}

export type ExportFormat = 'xlsx' | 'pdf' | 'html';

export interface SoaMeta {
  teamName:     string;
  framework:    string; // e.g. "MVSP v1.0-20211007"
  iso:          ISO;    // e.g. "mvps"
  dateOfExport: Date;
}

export interface SoaMetaExtras {
  // mapping from status code to localized label/description
  statusLabelMap?: Record<string, string>;
  statusMeaningMap?: Record<string, string>;
}

export interface SoaPayload {
  meta: SoaMeta;
  rows: SoaRow[];
}