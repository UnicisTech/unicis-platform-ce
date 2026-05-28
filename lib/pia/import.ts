import {
  parseRows,
  downloadTemplateXlsx,
  downloadTemplateCsv,
  downloadTemplateOds,
  type ImportRow,
} from '@/lib/modules/import';

type TFunc = (key: string, opts?: any) => string;

// ── Types ───────────────────────────────────────────────────────────────────

export const VALID_PROBABILITIES = [
  'rare',
  'unlikely',
  'possible',
  'probable',
  'severe',
] as const;
export const VALID_SECURITIES = [
  'insignificant',
  'minor',
  'moderate',
  'major',
  'extreme',
] as const;

export interface PiaImportRow extends ImportRow {
  title: string;
  confProbability: string;
  confSecurity: string;
  availProbability: string;
  availSecurity: string;
  transProbability: string;
  transSecurity: string;
}

// ── Headers & widths ────────────────────────────────────────────────────────

const HEADERS = (t: TFunc) => [
  t('title'),
  t('pia-conf-probability'),
  t('pia-conf-security'),
  t('pia-avail-probability'),
  t('pia-avail-security'),
  t('pia-trans-probability'),
  t('pia-trans-security'),
];

const COL_WIDTHS = [40, 18, 18, 18, 18, 18, 18];

// ── Template downloads ──────────────────────────────────────────────────────

const PROB_NOTE = `Valid values: ${VALID_PROBABILITIES.join(', ')}`;
const SEC_NOTE = `Valid values: ${VALID_SECURITIES.join(', ')}`;

export async function downloadPiaTemplateXlsx(t: TFunc) {
  await downloadTemplateXlsx(
    HEADERS(t),
    [
      'Example Risk Assessment',
      'possible',
      'moderate',
      'unlikely',
      'minor',
      'rare',
      'insignificant',
    ],
    {
      1: PROB_NOTE,
      2: SEC_NOTE,
      3: PROB_NOTE,
      4: SEC_NOTE,
      5: PROB_NOTE,
      6: SEC_NOTE,
    },
    COL_WIDTHS,
    'PIA_Import_Template.xlsx'
  );
}

export function downloadPiaTemplateCsv(t: TFunc) {
  downloadTemplateCsv(
    HEADERS(t),
    [
      'Example Risk Assessment',
      'possible',
      'moderate',
      'unlikely',
      'minor',
      'rare',
      'insignificant',
    ],
    `Probability: ${VALID_PROBABILITIES.join('/')} | Security: ${VALID_SECURITIES.join('/')}`,
    'PIA_Import_Template.csv'
  );
}

export function downloadPiaTemplateOds(t: TFunc) {
  downloadTemplateOds(
    HEADERS(t),
    [
      'Example Risk Assessment',
      'possible',
      'moderate',
      'unlikely',
      'minor',
      'rare',
      'insignificant',
    ],
    COL_WIDTHS,
    'PIA_Import_Template.ods'
  );
}

// ── Parse & validate ────────────────────────────────────────────────────────

function validateRow(cols: string[]): PiaImportRow {
  const title = (cols[0] ?? '').trim();
  const confProbability = (cols[1] ?? '').trim().toLowerCase();
  const confSecurity = (cols[2] ?? '').trim().toLowerCase();
  const availProbability = (cols[3] ?? '').trim().toLowerCase();
  const availSecurity = (cols[4] ?? '').trim().toLowerCase();
  const transProbability = (cols[5] ?? '').trim().toLowerCase();
  const transSecurity = (cols[6] ?? '').trim().toLowerCase();

  const errors: string[] = [];
  if (!title) errors.push('Title is required');

  const checkProb = (val: string, label: string) => {
    if (val && !VALID_PROBABILITIES.includes(val as any))
      errors.push(`Invalid ${label} probability "${val}"`);
  };
  const checkSec = (val: string, label: string) => {
    if (val && !VALID_SECURITIES.includes(val as any))
      errors.push(`Invalid ${label} security "${val}"`);
  };

  checkProb(confProbability, 'confidentiality');
  checkSec(confSecurity, 'confidentiality');
  checkProb(availProbability, 'availability');
  checkSec(availSecurity, 'availability');
  checkProb(transProbability, 'transparency');
  checkSec(transSecurity, 'transparency');

  // At least one risk dimension should be provided
  if (
    !confProbability &&
    !confSecurity &&
    !availProbability &&
    !availSecurity &&
    !transProbability &&
    !transSecurity
  ) {
    errors.push('At least one risk dimension is required');
  }

  return {
    title,
    confProbability,
    confSecurity,
    availProbability,
    availSecurity,
    transProbability,
    transSecurity,
    ...(errors.length ? { error: errors.join('; ') } : {}),
  };
}

export async function parsePiaImportFile(file: File): Promise<PiaImportRow[]> {
  const rows = await parseRows(file);
  return rows.map((cols) => validateRow(cols));
}
