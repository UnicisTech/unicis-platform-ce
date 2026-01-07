import frameworks from '@/lib/csc/frameworks-migration';
import { ISO } from 'types';
import { CscStatus } from '@/lib/csc/csc-statuses';
import { config } from '@/lib/rpa/migration-helpers';

type OptionLike = { value?: unknown };

const CSC_STATUS_VALUE_MAP: Record<string, CscStatus> = {
  Unknown: 'unknown',
  'Not Applicable': 'not-applicable',
  'Not Performed': 'not-performed',
  'Performed Informally': 'performed-informally',
  Planned: 'planned',
  'Well Defined': 'well-defined',
  'Quantitatively Controlled': 'quantitatively-controlled',
  'Continuously Improving': 'continuously-improving',
};

export function mapCscControlToIdAny(label: string): string | null {
  for (const fw of Object.keys(frameworks) as ISO[]) {
    const found = frameworks[fw].find((item) => item.control === label);
    if (found) {
      return found.id;
    }
  }

  error(`[CSC_STATUSES_ANY] UNKNOWN KEY LABEL: "${label}"`);
  return null;
}

export function mapCscControlToId(
  label: string,
  framework: ISO
): string | null {
  const mapped = frameworks[framework].find(
    (item) => item.control === label
  )?.id;
  if (!mapped) {
    error(
      `[CSC_STATUSES_${framework.toUpperCase()}] UNKNOWN KEY LABEL: "${label}"`
    );
    return null;
  }
  return mapped;
}

export function mapCscStatusValueLabelToId(label: string): string | null {
  const mapped = CSC_STATUS_VALUE_MAP[label];
  if (!mapped) {
    error(`[CSC_STATUSES_MVPS] UNKNOWN VALUE LABEL: "${label}"`);
    return null;
  }
  return mapped;
}

export const error = (...args: any[]) =>
  console.error('\x1b[31m%s\x1b[0m', args.join(' '));


// ----- RPA ------

type RpaFieldId = keyof typeof fieldPropsMapping;

export const fieldPropsMapping = {
  reviewDate: 'Review of the process',
  controller: 'Controller/Representative',
  dpo: 'Data Protection Officer (DPO)',
  purpose: 'Purpose of the Data Processing',
  category: 'Category of Personal Data',
  specialcategory: 'Special Category of Personal Data',
  datasubject: 'Category of Data Subjects',
  retentionperiod: 'Data retention period',
  commentsretention: 'Comments on data retention period and further details',
  recipientType: 'Type of Recipient',
  recipientdetails: 'Recipient details',
  datatransfer: 'Data Transfer',
  recipient: 'Recipient',
  country: 'Country',
  guarantee: 'Type of guarantees',
  toms: 'Type of security measures',
  involveProfiling: '1. Does it involve profiling?',
  useAutomated: '2. Does it use automated decision-making?',
  involveSurveillance: '3. Does it involve surveillance, GPS, or monitoring?',
  processedSpecialCategories:
    '4. Are special categories like criminal records processed?',
  isBigData: '5. Is a large amount of data processed (Big Data)?',
  dataSetsCombined: '6. Are data sets combined?',
  multipleControllers: '7. Are there multiple controllers?',
  imbalanceInRelationship:
    '8. Is there an imbalance in the controller-subject relationship?',
  innovativeTechnologyUsed: '9. Is an innovative technology used?',
  transferredOutside: '10. Is data transferred outside the EU?',
  rightsRestricted: `11. Are subjects' rights restricted?`,
  piaNeeded: '12. Is a data protection impact assessment needed?',
} as const;

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

const LABEL_TO_ID: Record<string, RpaFieldId> = (() => {
  const out: Record<string, RpaFieldId> = {};
  for (const [id, label] of Object.entries(fieldPropsMapping) as Array<
    [RpaFieldId, string]
  >) {
    out[normalizeText(label)] = id;
  }
  return out;
})();

/**
 * label -> id
 * id -> id (idempotently)
 */

export function rpaFieldToId(input: string): RpaFieldId | null {
  if (!input) return null;

  const raw = input.trim();

  // 1) If its already ID
  if (raw in fieldPropsMapping) {
    return raw as RpaFieldId;
  }

  // 2) If its label (case-insensitive)
  const byLabel = LABEL_TO_ID[normalizeText(raw)];
  if (byLabel) return byLabel;

  error(`[RPA_FIELD] UNKNOWN field label/id: "${input}"`);
  return null;
}

export function optionToString(
  input: unknown,
  context: string
): string | unknown {
  if (typeof input === 'string') return input;

  if (input && typeof input === 'object' && 'value' in input) {
    const v = (input as OptionLike).value;
    if (typeof v === 'string') return v;

    error(`[OPTION] invalid option.value (${context})`, JSON.stringify(input));
    return input;
  }

  return input;
}

export function optionArrayToStringArray(
  input: unknown,
  context: string
): unknown {
  if (!Array.isArray(input)) return input;

  let changed = false;
  const out: string[] = [];

  for (const item of input) {
    if (typeof item === 'string') {
      out.push(item);
      continue;
    }

    const mapped = optionToString(item, `${context}[]`);
    if (typeof mapped === 'string') {
      out.push(mapped);
      changed = true;
      continue;
    }

    error(`[OPTION] invalid option[] item (${context})`, JSON.stringify(item));
    out.push(String(item));
    changed = true;
  }

  return changed ? out : input;
}

export function preview(v: unknown, max = 120): string {
  try {
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    if (!s) return String(v);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return String(v);
  }
}

type LabelValue = { label: string; value: string };


function buildLabelToValueMap(options: LabelValue[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const opt of options) {
    if (typeof opt?.label === 'string' && typeof opt?.value === 'string') {
      m.set(opt.label, opt.value);
      // ідемпотентність: якщо вже value, лишаємо value
      if (!m.has(opt.value)) m.set(opt.value, opt.value);
    }
  }
  return m;
}

function unwrapOptionLike(
  v: unknown,
  ctx: string,
  idx: number,
  fieldId: string
): { out: unknown; ch: boolean } {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'value' in v) {
    const val = (v as OptionLike).value;
    if (typeof val === 'string') return { out: val, ch: true };

    error(
      `[RPA_AUDIT] Invalid option.value for fieldId="${fieldId}"`,
      `logIndex=${idx}`,
      `${ctx}=${preview(v)}`
    );
    return { out: v, ch: false };
  }

  return { out: v, ch: false };
}

export function mapValueByFieldConfig(
  fieldId: string,
  input: unknown,
  context: { idx: number; which: 'prevValue' | 'nextValue' }
): { value: unknown; changed: boolean } {
  if (input == null) return { value: input, changed: false };

  // 0) unwrap Option / Option[] -> string / string[]
  let unwrapChanged = false;

  if (Array.isArray(input)) {
    let any = false;
    const unwrapped = input.map((item, i) => {
      const r = unwrapOptionLike(
        item,
        `${context.which}[${i}]`,
        context.idx,
        fieldId
      );
      if (r.ch) any = true;
      return r.out;
    });
    if (any) {
      input = unwrapped;
      unwrapChanged = true;
    }
  } else {
    const r = unwrapOptionLike(
      input,
      context.which,
      context.idx,
      fieldId
    );
    if (r.ch) {
      input = r.out;
      unwrapChanged = true;
    }
  }

  const options = config[fieldId];
  if (!options) {
    error(
      `[RPA_AUDIT] Missing config for selector fieldId="${fieldId}"`,
      `logIndex=${context.idx}`,
      `value(${context.which})=${preview(input)}`
    );
    return { value: input, changed: unwrapChanged };
  }

  const map = buildLabelToValueMap(options);

  const mapOne = (v: unknown, itemCtx: string): { out: unknown; ch: boolean } => {
    if (typeof v !== 'string') {
      error(
        `[RPA_AUDIT] Expected string for selector fieldId="${fieldId}"`,
        `logIndex=${context.idx}`,
        `${itemCtx}=${preview(v)}`
      );
      return { out: v, ch: false };
    }

    const mapped = map.get(v);
    if (!mapped) {
      error(
        `[RPA_AUDIT] Unknown option label for fieldId="${fieldId}"`,
        `logIndex=${context.idx}`,
        `${itemCtx}="${v}"`
      );
      return { out: v, ch: false };
    }

    return { out: mapped, ch: mapped !== v };
  };

  if (Array.isArray(input)) {
    let changed = false;
    const out = input.map((item, i) => {
      const r = mapOne(item, `${context.which}[${i}]`);
      if (r.ch) changed = true;
      return r.out;
    });
    return { value: out, changed: unwrapChanged || changed };
  }

  const r = mapOne(input, context.which);
  return { value: r.out, changed: unwrapChanged || r.ch };
}