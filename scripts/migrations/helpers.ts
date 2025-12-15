import frameworks from '@/lib/csc/frameworks-migration';
import { ISO } from 'types';
import { CscStatus } from '@/lib/csc/csc-statuses';

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
