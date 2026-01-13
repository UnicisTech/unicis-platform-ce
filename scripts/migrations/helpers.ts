import frameworks from '@/lib/csc/frameworks-migration';
import { Diff, ISO } from 'types';
import { CscStatus } from '@/lib/csc/csc-statuses';
import { config as rpaConfig } from '@/lib/rpa/migration-helpers';
import { config as tiaConfig } from '@/lib/tia/migration-helpers';
import { config as piaConfig } from '@/lib/pia/migration-helpers';

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

export const warn = (...args: any[]) =>
  console.warn('\x1b[33m%s\x1b[0m', args.join(' '));

type AppContext = 'TIA' | 'RPA' | 'PIA'

const configs = {
  'RPA': rpaConfig,
  'TIA': tiaConfig,
  'PIA': piaConfig,
}
// ----- RPA ------

type RpaFieldId = keyof typeof rpaFieldPropsMapping;

export const rpaFieldPropsMapping = {
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

const RPA_FIELD_LABEL_TO_ID: Record<string, RpaFieldId> = (() => {
  const out: Record<string, RpaFieldId> = {};
  for (const [id, label] of Object.entries(rpaFieldPropsMapping) as Array<
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
  if (raw in rpaFieldPropsMapping) {
    return raw as RpaFieldId;
  }

  // 2) If its label (case-insensitive)
  const byLabel = RPA_FIELD_LABEL_TO_ID[normalizeText(raw)];
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
  fieldId: string,
  appContext: AppContext,
): { out: unknown; ch: boolean } {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'value' in v) {
    const val = (v as OptionLike).value;
    if (typeof val === 'string') return { out: val, ch: true };

    error(
      `[${appContext}_AUDIT] Invalid option.value for fieldId="${fieldId}"`,
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
  context: { idx: number; which: 'prevValue' | 'nextValue' },
  appContext: AppContext
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
        fieldId,
        appContext
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
      fieldId,
      appContext
    );
    if (r.ch) {
      input = r.out;
      unwrapChanged = true;
    }
  }

  const options = configs[appContext][fieldId];
  if (!options) {
    // its not a selector
    return { value: input, changed: unwrapChanged };
  }

  const map = buildLabelToValueMap(options);

  const mapOne = (v: unknown, itemCtx: string): { out: unknown; ch: boolean } => {
    if (typeof v !== 'string') {
      error(
        `[${appContext}_AUDIT] Expected string for selector fieldId="${fieldId}"`,
        `logIndex=${context.idx}`,
        `${itemCtx}=${preview(v)}`
      );
      return { out: v, ch: false };
    }
    // console.log('map', {map, v})
    const mapped = map.get(v);
    if (!mapped) {
      // console.log('map', {map, v})
      error(
        `[${appContext}_AUDIT] Unknown option label for fieldId="${fieldId}"`,
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


// ----- TIA -----

type CountryLike = { label?: unknown; value?: unknown };

export function countryToValue(input: unknown, context: string): unknown {
  // already normalized
  if (typeof input === 'string') return input;

  // looks like Country
  if (input && typeof input === 'object' && !Array.isArray(input) && 'value' in input) {
    const v = (input as CountryLike).value;
    if (typeof v === 'string') return v;

    error(`[TIA] Invalid Country.value (${context})`, JSON.stringify(input));
    return input;
  }

  return input;
}

type TiaFieldId = keyof typeof tiaFieldPropsMapping;

export const tiaFieldPropsMapping = {
  DataExporter: 'a) Data exporter',
  CountryDataExporter: 'b) Country of data exporter',
  DataImporter: 'c) Data importer',
  CountryDataImporter: 'd) Country of data importer',
  TransferScenario: 'e) Transfer scenario',
  DataAtIssue: 'f) Data at issue',
  HowDataTransfer: 'g) How the data is transferred',
  StartDateAssessment: 'h) Starting date of the assessment',
  AssessmentYears: 'i) Assessment period in year',
  EndDateAssessment: 'i) Ending date of the assessment',
  LawImporterCountry: "j) Laws of importer's country",
  EncryptionInTransit: 'a) Encryption in-transit',
  ReasonEncryptionInTransit: 'Reasoning about adequate encryption in-transit',
  TransferMechanism: 'b) Transfer mechanism',
  ReasonTransferMechanism: 'Reasoning about transfer mechanism',
  LawfulAccess: 'c) Targeted lawful access',
  ReasonLawfulAccess: 'Reasoning about targeted lawful access',
  MassSurveillanceTelecommunications:
    'd) Mass surveillance of telecommunications',
  ReasonMassSurveillanceTelecommunications:
    'Reasoning about mass surveillance of telecommunications',
  SelfReportingObligations: 'e) Self-reporting obligations',
  ReasonSelfReportingObligations: 'Reasoning about self-reporting obligations',
  WarrantsSubpoenas: 'a) Warrants or subpoenas',
  ReasonWarrantsSubpoenas: 'Reasoning about warrants or subpoenas',
  ViolationLocalLaw: 'b) Violation of local law',
  ReasonViolationLocalLaw: 'Reasoning about violation of local law',
  HighViolationLocalLaw: 'c) High probability of violating local laws',
  ReasonHighViolationLocalLaw:
    'Reasoning about high probability of violating local laws',
  HighViolationDataIssue:
    'd) High probability of violating local laws and the data at issue',
  ReasonHighViolationDataIssue:
    'Reasoning about high probability of violating local laws and the data at issue',
  InvestigatingImporter:
    'e) Local authorities would be interested investigating the importer',
  ReasonInvestigatingImporter:
    'Reasoning about Local authorities would be interested investigating the importer',
  PastWarrantSubpoena:
    'f) In the past 5-10 years the importer was already required to produce a warrant or subpoena',
  ReasonPastWarrantSubpoena:
    'Reasoning about producing warrant and subpoena in the past 5-10 years',
  DataIssueInvestigation:
    'g) Does the importer have reason to produced of the data at issue for an investigation?',
  ReasonDataIssueInvestigation:
    'Reasoning about produced of the data at issue for an investigation',
  LocalIssueWarrants:
    'h) Local authorities have the right to issue warrants or subpoenas',
  ReasonLocalIssueWarrants:
    'Reasoning about produced of the data at issue for an investigation',
  LocalMassSurveillance:
    'i) The type of the data at issue is in principle of interest for mass surveillance',
  ReasonLocalMassSurveillance:
    'Reasoning about the type of the data at issue is in principle of interest for mass surveillance',
  LocalAccessMassSurveillance:
    'j) Local authorities could ask for access to such type of data',
  ReasonLocalAccessMassSurveillance:
    'Reasoning about the local authorities could ask for access to such type of data for mass surveillance',
  LocalRoutinelyMonitor:
    'k) Other reasons why requiring the importer to routinely monitor the data at issue',
  ReasonLocalRoutinelyMonitor:
    'Reasoning about why requiring the importer to routinely monitor the data at issue',
  PassMassSurveillance: 'l) In pass already required mass surveillance',
  ReasonPassMassSurveillance:
    'Reasoning about in pass already required mass surveillance',
  PassMassSurveillanceConnection:
    'm) Produce some of the data at issue in connection with such mass surveillance?',
  ReasonPassMassSurveillanceConnection:
    'Reasoning about producing some of the data at issue in connection with such mass surveillance?',
  ImporterObligation:
    'n) The importer subject to reporting obligation with the type of data at issue',
  ReasonImporterObligation:
    'Reasoning about the importer subject to reporting obligation with the type of data at issue',
  LocalSelfReporting:
    'o) The data at issue contains information to local self-reporting',
  ReasonLocalSelfReporting:
    'Reasoning about the data at issue contains information to local self-reporting',
  PastSelfReporting: 'p) Past 5-10 years self-reported',
  ReasonPastSelfReporting:
    'Reasoning about past 5-10 years self-reported to authorities',
  AssessmentProduceReport:
    'q) Does the importer has a reason to produce the data at issue',
  ReasonAssessmentProduceReport:
    'Reasoning about does the importer has a reason to produce the data at issue',
  RelevantDataTransferImporter: 'Relevant for',
  ProbabilityDataTransferImporter: 'Probability in [%]',
  ReasonDataTransferImporter: 'Reasoning',
  RelevantTransferToImporter: 'Relevant for',
  ProbabilityTransferToImporter: 'Probability in [%]',
  ReasonTransferToImporter: 'Reasoning',
  RelevantTransferToImporterForPerformance: 'Relevant for',
  ProbabilityTransferToImporterPerformance: 'Probability in [%]',
  ReasonTransferToImporterPerformance: 'Reasoning',
  RelevantLegalGround: 'Relevant for',
  ProbabilityLegalGround: 'Probability in [%]',
  ReasonLegalGround: 'Reasoning',
  ConnectionTargetedAccess: 'e) ...in connection with targeted lawful access',
  ReasonConnectionTargetedAccess:
    'Reasoning about connection with targeted lawful access',
  ConnectionSurveillanceTele:
    'f) … in connection with mass surveillance of telecommunications, online services, etc.',
  ReasonConnectionSurveillanceTele:
    'Reasoning about connection with mass surveillance of telecommunications',
  ConnectionSelfreportingObligations:
    'g) … in connection with self-reporting obligations of the importer',
  ReasonConnectionSelfreportingObligations:
    'Reasoning about connection with self-reporting obligations',
} as const;

const TIA_FIELD_LABEL_TO_ID: Record<string, TiaFieldId> = (() => {
  const out: Record<string, TiaFieldId> = {};
  for (const [id, label] of Object.entries(tiaFieldPropsMapping) as Array<
    [TiaFieldId, string]
  >) {
    out[normalizeText(label)] = id;
  }
  return out;
})();

export function tiaFieldToId(input: string): TiaFieldId | null {
  if (!input) return null;

  const raw = input.trim();

  // 1) If its already ID
  if (raw in tiaFieldPropsMapping) {
    return raw as TiaFieldId;
  }

  // 2) If its label (case-insensitive)
  const byLabel = TIA_FIELD_LABEL_TO_ID[normalizeText(raw)];
  if (byLabel) return byLabel;

  error(`[TIA_FIELD] UNKNOWN field label/id: "${input}"`);
  return null;
}

// ------ PIA ------

type PiaFieldId = keyof typeof piaFieldPropsMapping;

export const piaFieldPropsMapping = {
  isDataProcessingNecessary: 'Is the data processing necessary',
  isDataProcessingNecessaryAssessment: 'Assessment',

  isProportionalToPurpose: 'Is it proportional to the purpose',
  isProportionalToPurposeAssessment: 'Assessment',

  confidentialityRiskProbability: 'Probability of the risk',
  confidentialityRiskSecurity: 'Impact of the risk',
  confidentialityAssessment: 'Assessment',

  availabilityRiskProbability: 'Probability of the risk',
  availabilityRiskSecurity: 'Impact of the risk',
  availabilityAssessment: 'Assessment',

  transparencyRiskProbability: 'Probability of the risk',
  transparencyRiskSecurity: 'Impact of the risk',
  transparencyAssessment: 'Assessment',

  guarantees: 'Guarantees',
  securityMeasures: 'Security measures',
  securityCompliance:
    'Compliance with security notices issued by supervisory authorities',
  dealingWithResidualRisk: 'Dealing with existing residual risk',
  dealingWithResidualRiskAssessment: 'Assessment',
  supervisoryAuthorityInvolvement:
    'Involvement of the supervisory authority if the risk is unacceptable',
} as const;

const PIA_FIELD_LABEL_TO_ID: Record<string, PiaFieldId> = (() => {
  const out: Record<string, PiaFieldId> = {};
  for (const [id, label] of Object.entries(piaFieldPropsMapping) as Array<
    [PiaFieldId, string]
  >) {
    out[normalizeText(label)] = id;
  }
  return out;
})();

export function piaFieldToId(input: string): PiaFieldId | null {
  if (!input) return null;

  const raw = input.trim();

  // 1) If its already ID
  if (raw in piaFieldPropsMapping) {
    return raw as PiaFieldId;
  }

  // 2) If its label (case-insensitive)
  const byLabel = PIA_FIELD_LABEL_TO_ID[normalizeText(raw)];
  if (byLabel) return byLabel;

  error(`[PIA_FIELD] UNKNOWN field label/id: "${input}"`);
  return null;
}

export function stripOuterQuotes<T>(value: T): T {
  if (
    typeof value === 'string' &&
    value.length >= 2 &&
    value.startsWith('"') &&
    value.endsWith('"')
  ) {
    return value.slice(1, -1) as T;
  }

  return value;
}

const SPECIAL_FIELDS = {
  probability: 'Probability of the risk',
  impact: 'Impact of the risk',
  assessment: 'Assessment',
} as const;

const PROBABILITY_KEYS = [
  'confidentialityRiskProbability',
  'availabilityRiskProbability',
  'transparencyRiskProbability',
] as const;

const IMPACT_KEYS = [
  'confidentialityRiskSecurity',
  'availabilityRiskSecurity',
  'transparencyRiskSecurity',
] as const;

function findMatchingConfigKeys(
  keys: readonly string[],
  prevValue: string,
  nextValue: string
): string[] {
  const prev = normalizeText(stripOuterQuotes(prevValue));
  const next = normalizeText(stripOuterQuotes(nextValue));

  const matches: string[] = [];

  for (const key of keys) {
    const items = configs['PIA'][key] ?? [];
    for (const it of items) {
      const lbl = normalizeText(it.label);
      if (lbl === prev || lbl === next) {
        matches.push(key);
        break;
      }
    }
  }

  return matches;
}

export function resolvePiaAuditFieldId(args: {
  diff: Diff;
  // i: number;
  event: string;
}): PiaFieldId | string | null {
  const { diff, event } = args;
  if (!diff) return null;

  const rawField = diff.field?.trim?.() ?? '';
  if (!rawField) return rawField;

  // 0) Special cases FIRST (бо лейбли неунікальні)
  if (rawField === SPECIAL_FIELDS.assessment) {
    warn(
      `[PIA_AUDIT] Field id not recognized`,
      // `logIndex=${i}`,
      `event=${event}`,
      `diff=${preview(diff)}`
    );
    return rawField;
  }

  const isProbability = rawField === SPECIAL_FIELDS.probability;
  const isImpact = rawField === SPECIAL_FIELDS.impact;

  if (isProbability || isImpact) {
    const keys = isProbability ? PROBABILITY_KEYS : IMPACT_KEYS;
    const matchedKeys = findMatchingConfigKeys(keys, diff.prevValue as string, diff.nextValue as string);

    if (matchedKeys.length === 1) {
      return matchedKeys[0] as PiaFieldId;
    }

    warn(
      `[PIA_AUDIT] Field id not recognized`,
      // `logIndex=${i}`,
      `event=${event}`,
      `diff=${preview(diff)}`,
      `matchedKeys=${preview(matchedKeys)}`
    );
    return rawField;
  }

  // 1) Default path AFTER specials
  const direct = piaFieldToId(rawField);
  if (direct) return direct;

  return rawField;
}

// ------ RM ------

type RmFieldId = keyof typeof rmFieldPropsMapping;

export const rmFieldPropsMapping = {
  Risk: 'Risk',
  AssetOwner: 'Asset owner',
  Impact: 'Impact',
  RawProbability: 'Raw probability',
  RawImpact: 'Raw impact',
  RiskTreatment: 'Risk treatment',
  TreatmentCost: 'Treatment cost',
  TreatmentStatus: 'Treatment status',
  TreatedProbability: 'Treated probability',
  TreatedImpact: 'Treated impact',
} as const;

const RM_FIELD_LABEL_TO_ID: Record<string, RmFieldId> = (() => {
  const out: Record<string, RmFieldId> = {};
  for (const [id, label] of Object.entries(rmFieldPropsMapping) as Array<
    [RmFieldId, string]
  >) {
    out[normalizeText(label)] = id;
  }
  return out;
})();

export function tryExtractValueFromStringifiedJson(
  input: unknown,
  context: string
): { out: unknown; changed: boolean } {
  if (typeof input !== 'string') return { out: input, changed: false };

  const s = input.trim();
  // швидка відсічка
  if (!(s.startsWith('{') && s.endsWith('}')) && !(s.startsWith('[') && s.endsWith(']'))) {
    return { out: input, changed: false };
  }

  try {
    const parsed = JSON.parse(s);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'value' in parsed) {
      const v = (parsed as any).value;
      // повертаємо value як є, але найчастіше це string
      return { out: v, changed: v !== input };
    }

    error(`[RM_AUDIT] AssetOwner JSON parsed but has no "value"`, context, `json=${s}`);
    return { out: input, changed: false };
  } catch {
    return { out: input, changed: false };
  }
}

export function rmFieldToId(input: string): RmFieldId | null {
  if (!input) return null;

  const raw = input.trim();

  // 1) If its already ID
  if (raw in rmFieldPropsMapping) {
    return raw as RmFieldId;
  }

  // 2) If its label (case-insensitive)
  const byLabel = RM_FIELD_LABEL_TO_ID[normalizeText(raw)];
  if (byLabel) return byLabel;

  error(`[RM_FIELD] UNKNOWN field label/id: "${input}"`);
  return null;
}


