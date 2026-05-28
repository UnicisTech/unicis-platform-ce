import {
  parseRows,
  downloadTemplateXlsx,
  downloadTemplateCsv,
  downloadTemplateOds,
  type ImportRow,
} from '@/lib/modules/import';

type TFunc = (key: string, opts?: any) => string;

// ── Types ───────────────────────────────────────────────────────────────────

export interface TiaImportRow extends ImportRow {
  title: string;
  dataExporter: string;
  countryExporter: string;
  dataImporter: string;
  countryImporter: string;
  assessmentDate: string;
  assessmentYears: string;
}

// ── Headers & widths ────────────────────────────────────────────────────────

const HEADERS = (t: TFunc) => [
  t('title'),
  t('tia-data-exporter'),
  t('tia-country-exporter'),
  t('tia-data-importer'),
  t('tia-country-importer'),
  t('tia-assessment-date'),
  t('tia-assessment-years'),
];

const COL_WIDTHS = [40, 25, 20, 25, 20, 16, 14];

// ── Template downloads ──────────────────────────────────────────────────────

export async function downloadTiaTemplateXlsx(t: TFunc) {
  await downloadTemplateXlsx(
    HEADERS(t),
    [
      'Example Data Transfer',
      'Acme Corp',
      'germany',
      'Cloud Inc',
      'united states',
      '2025-01-15',
      '3',
    ],
    { 5: 'Format: YYYY-MM-DD', 6: 'Number of years (1-5)' },
    COL_WIDTHS,
    'TIA_Import_Template.xlsx'
  );
}

export function downloadTiaTemplateCsv(t: TFunc) {
  downloadTemplateCsv(
    HEADERS(t),
    [
      'Example Data Transfer',
      'Acme Corp',
      'germany',
      'Cloud Inc',
      'united states',
      '2025-01-15',
      '3',
    ],
    'Assessment Date: YYYY-MM-DD | Assessment Years: number (1-5)',
    'TIA_Import_Template.csv'
  );
}

export function downloadTiaTemplateOds(t: TFunc) {
  downloadTemplateOds(
    HEADERS(t),
    [
      'Example Data Transfer',
      'Acme Corp',
      'germany',
      'Cloud Inc',
      'united states',
      '2025-01-15',
      '3',
    ],
    COL_WIDTHS,
    'TIA_Import_Template.ods'
  );
}

// ── Parse & validate ────────────────────────────────────────────────────────

function validateRow(cols: string[]): TiaImportRow {
  const title = (cols[0] ?? '').trim();
  const dataExporter = (cols[1] ?? '').trim();
  const countryExporter = (cols[2] ?? '').trim();
  const dataImporter = (cols[3] ?? '').trim();
  const countryImporter = (cols[4] ?? '').trim();
  const assessmentDate = (cols[5] ?? '').trim();
  const assessmentYears = (cols[6] ?? '').trim();

  const errors: string[] = [];
  if (!title) errors.push('Title is required');
  if (!dataExporter) errors.push('Data exporter is required');
  if (!dataImporter) errors.push('Data importer is required');
  if (assessmentDate && isNaN(Date.parse(assessmentDate)))
    errors.push(`Invalid date "${assessmentDate}"`);
  const years = Number(assessmentYears);
  if (assessmentYears && (isNaN(years) || years < 1 || years > 10))
    errors.push(`Assessment years must be between 1 and 10`);

  return {
    title,
    dataExporter,
    countryExporter,
    dataImporter,
    countryImporter,
    assessmentDate,
    assessmentYears,
    ...(errors.length ? { error: errors.join('; ') } : {}),
  };
}

export async function parseTiaImportFile(file: File): Promise<TiaImportRow[]> {
  const rows = await parseRows(file);
  return rows.map((cols) => validateRow(cols));
}
