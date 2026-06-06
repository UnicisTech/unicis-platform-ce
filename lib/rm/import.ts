import {
  parseRows,
  downloadTemplateXlsx,
  downloadTemplateCsv,
  downloadTemplateOds,
  type ImportRow,
} from '@/lib/modules/import';

type TFunc = (key: string, opts?: any) => string;

// ── Types ───────────────────────────────────────────────────────────────────

export interface RmImportRow extends ImportRow {
  title: string;
  risk: string;
  assetOwner: string;
  impact: string;
  rawProbability: string;
  rawImpact: string;
  riskTreatment: string;
  treatmentCost: string;
  treatmentStatus: string;
  treatedProbability: string;
  treatedImpact: string;
}

// ── Headers & widths ────────────────────────────────────────────────────────

const HEADERS = (t: TFunc) => [
  t('title'),
  t('rm:fields.Risk'),
  t('rm:fields.AssetOwner'),
  t('rm:fields.Impact'),
  t('rm:fields.RawProbability'),
  t('rm:fields.RawImpact'),
  t('rm:headers.treatment'),
  t('rm:fields.TreatmentCost'),
  t('rm:fields.TreatmentStatus'),
  t('rm:fields.TreatedProbability'),
  t('rm:fields.TreatedImpact'),
];

const COL_WIDTHS = [40, 25, 18, 18, 16, 16, 25, 16, 16, 16, 16];

// ── Template downloads ──────────────────────────────────────────────────────

const PCT_NOTE = 'Number 0-100 (percentage)';

export async function downloadRmTemplateXlsx(t: TFunc) {
  await downloadTemplateXlsx(
    HEADERS(t),
    [
      'Example Risk',
      'Data breach',
      'John Doe',
      'Financial loss',
      '60',
      '80',
      'Encrypt data',
      'Medium',
      '50',
      '40',
      '40',
    ],
    { 4: PCT_NOTE, 5: PCT_NOTE, 8: PCT_NOTE, 9: PCT_NOTE, 10: PCT_NOTE },
    COL_WIDTHS,
    'RM_Import_Template.xlsx'
  );
}

export function downloadRmTemplateCsv(t: TFunc) {
  downloadTemplateCsv(
    HEADERS(t),
    [
      'Example Risk',
      'Data breach',
      'John Doe',
      'Financial loss',
      '60',
      '80',
      'Encrypt data',
      'Medium',
      '50',
      '40',
      '40',
    ],
    'Probability/Impact/Status values: 0-100 (percentage)',
    'RM_Import_Template.csv'
  );
}

export function downloadRmTemplateOds(t: TFunc) {
  downloadTemplateOds(
    HEADERS(t),
    [
      'Example Risk',
      'Data breach',
      'John Doe',
      'Financial loss',
      '60',
      '80',
      'Encrypt data',
      'Medium',
      '50',
      '40',
      '40',
    ],
    COL_WIDTHS,
    'RM_Import_Template.ods'
  );
}

// ── Parse & validate ────────────────────────────────────────────────────────

function validatePct(val: string, label: string): string | null {
  if (!val) return null;
  const n = Number(val);
  if (isNaN(n) || n < 0 || n > 100) return `${label} must be 0-100`;
  return null;
}

function validateRow(cols: string[]): RmImportRow {
  const title = (cols[0] ?? '').trim();
  const risk = (cols[1] ?? '').trim();
  const assetOwner = (cols[2] ?? '').trim();
  const impact = (cols[3] ?? '').trim();
  const rawProbability = (cols[4] ?? '').trim();
  const rawImpact = (cols[5] ?? '').trim();
  const riskTreatment = (cols[6] ?? '').trim();
  const treatmentCost = (cols[7] ?? '').trim();
  const treatmentStatus = (cols[8] ?? '').trim();
  const treatedProbability = (cols[9] ?? '').trim();
  const treatedImpact = (cols[10] ?? '').trim();

  const errors: string[] = [];
  if (!title) errors.push('Title is required');
  if (!risk) errors.push('Risk is required');

  const pctChecks = [
    validatePct(rawProbability, 'Raw Probability'),
    validatePct(rawImpact, 'Raw Impact'),
    validatePct(treatmentStatus, 'Treatment Status'),
    validatePct(treatedProbability, 'Treated Probability'),
    validatePct(treatedImpact, 'Treated Impact'),
  ];
  pctChecks.forEach((e) => {
    if (e) errors.push(e);
  });

  return {
    title,
    risk,
    assetOwner,
    impact,
    rawProbability,
    rawImpact,
    riskTreatment,
    treatmentCost,
    treatmentStatus,
    treatedProbability,
    treatedImpact,
    ...(errors.length ? { error: errors.join('; ') } : {}),
  };
}

export async function parseRmImportFile(file: File): Promise<RmImportRow[]> {
  const rows = await parseRows(file);
  return rows.map((cols) => validateRow(cols));
}
