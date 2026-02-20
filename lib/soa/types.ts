import type { ISO } from 'types';
import type { CscStatus } from '@/lib/csc/csc-statuses';

export interface SoaRow {
  code:         string;
  section:      string;
  control:      string;
  requirements: string;
  status:       CscStatus | 'unknown';
}

export type ExportFormat = 'xlsx' | 'pdf' | 'html';

export interface SoaMeta {
  teamName:     string;
  framework:    string; // e.g. "MVSP v1.0-20211007"
  iso:          ISO;    // e.g. "mvps"
  dateOfExport: Date;
}

export interface SoaPayload {
  meta: SoaMeta;
  rows: SoaRow[];
}