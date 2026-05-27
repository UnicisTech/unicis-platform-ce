import {
  parseRows,
  downloadTemplateXlsx,
  downloadTemplateCsv,
  downloadTemplateOds,
  type ImportRow,
} from '@/lib/modules/import';

type TFunc = (key: string, opts?: any) => string;

// ── Types ───────────────────────────────────────────────────────────────────

export interface RpaImportRow extends ImportRow {
  title: string;
  controller: string;
  reviewDate: string;
  dataTransfer: string;
  specialCategories: string;
}

// ── Headers & widths ────────────────────────────────────────────────────────

const HEADERS = (t: TFunc) => [
  t('title'),
  t('controller'),
  t('rpa-review'),
  t('rpa-data-tranfer'),
  t('rpa-category'),
];

const COL_WIDTHS = [40, 25, 16, 16, 35];

// ── Template downloads ──────────────────────────────────────────────────────

export async function downloadRpaTemplateXlsx(t: TFunc) {
  await downloadTemplateXlsx(
    HEADERS(t),
    ['Example Processing Activity', 'John Doe', '2025-01-15', 'true', 'health, biometric'],
    { 3: 'true or false', 4: 'Comma-separated list' },
    COL_WIDTHS,
    'RPA_Import_Template.xlsx'
  );
}

export function downloadRpaTemplateCsv(t: TFunc) {
  downloadTemplateCsv(
    HEADERS(t),
    ['Example Processing Activity', 'John Doe', '2025-01-15', 'true', 'health, biometric'],
    'Data Transfer: true/false | Special Categories: comma-separated',
    'RPA_Import_Template.csv'
  );
}

export function downloadRpaTemplateOds(t: TFunc) {
  downloadTemplateOds(
    HEADERS(t),
    ['Example Processing Activity', 'John Doe', '2025-01-15', 'true', 'health, biometric'],
    COL_WIDTHS,
    'RPA_Import_Template.ods'
  );
}

// ── Parse & validate ────────────────────────────────────────────────────────

function validateRow(cols: string[]): RpaImportRow {
  const title = (cols[0] ?? '').trim();
  const controller = (cols[1] ?? '').trim();
  const reviewDate = (cols[2] ?? '').trim();
  const dataTransfer = (cols[3] ?? '').trim().toLowerCase();
  const specialCategories = (cols[4] ?? '').trim();

  const errors: string[] = [];
  if (!title) errors.push('Title is required');
  if (reviewDate && isNaN(Date.parse(reviewDate))) errors.push(`Invalid date "${reviewDate}"`);
  if (dataTransfer && !['true', 'false', ''].includes(dataTransfer))
    errors.push(`Data transfer must be "true" or "false"`);

  return {
    title,
    controller,
    reviewDate,
    dataTransfer,
    specialCategories,
    ...(errors.length ? { error: errors.join('; ') } : {}),
  };
}

export async function parseRpaImportFile(file: File): Promise<RpaImportRow[]> {
  const rows = await parseRows(file);
  return rows.map((cols) => validateRow(cols));
}
