import type { Task } from '@/generated/browser';
import type {
  AuditLog,
  Diff,
  Option,
  PiaConfig,
  // PiaRisk,
  TaskProperties,
} from 'types';
import type { RiskProbability, RiskSecurity } from 'types/pia';

export const config = {
  isDataProcessingNecessary: ['necessary', 'unnecessary'],
  isProportionalToPurpose: ['proportional', 'not_proportional'],
  confidentialityRiskProbability: [
    'rare',
    'unlikely',
    'possible',
    'probable',
    'severe',
  ],
  confidentialityRiskSecurity: [
    'insignificant',
    'minor',
    'moderate',
    'major',
    'extreme',
  ],
  availabilityRiskProbability: [
    'rare',
    'unlikely',
    'possible',
    'probable',
    'severe',
  ],
  availabilityRiskSecurity: [
    'insignificant',
    'minor',
    'moderate',
    'major',
    'extreme',
  ],
  transparencyRiskProbability: [
    'rare',
    'unlikely',
    'possible',
    'probable',
    'severe',
  ],
  transparencyRiskSecurity: [
    'insignificant',
    'minor',
    'moderate',
    'major',
    'extreme',
  ],
  dealingWithResidualRisk: [
    'acceptable',
    'acceptable_with_conditions',
    'not_acceptable',
  ],
  supervisoryAuthorityInvolvement: ['yes', 'no'],
};

export const steps = [
  'dataProcessing',
  'confidentialityAndIntegrity',
  'availability',
  'transparencyAndDataMinimization',
  'results',
  'correctiveMeasures',
];

export const fields = [
  'isDataProcessingNecessary',
  'isDataProcessingNecessaryAssessment',
  'isProportionalToPurpose',
  'isProportionalToPurposeAssessment',
  'confidentialityRiskProbability',
  'confidentialityRiskSecurity',
  'confidentialityAssessment',
  'availabilityRiskProbability',
  'availabilityRiskSecurity',
  'availabilityAssessment',
  'transparencyRiskProbability',
  'transparencyRiskSecurity',
  'transparencyAssessment',
  'guarantees',
  'securityMeasures',
  'securityCompliance',
  'dealingWithResidualRisk',
  'dealingWithResidualRiskAssessment',
  'supervisoryAuthorityInvolvement',
];

export const riskProbabilityPoints: Record<RiskProbability, number> = {
  rare: 0,
  unlikely: 1,
  possible: 2,
  probable: 3,
  severe: 4,
};

export const riskSecurityPoints: Record<RiskSecurity, number> = {
  insignificant: 0,
  minor: 1,
  moderate: 2,
  major: 3,
  extreme: 4,
};

export const fieldPropsMapping = {
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
};

export const configWithLabels: PiaConfig = {
  isDataProcessingNecessary: [
    { value: 'necessary', label: 'Necessary' },
    { value: 'unnecessary', label: 'Unnecessary' },
  ],
  isProportionalToPurpose: [
    { value: 'proportional', label: 'Proportional' },
    { value: 'not_proportional', label: 'Not proportional' },
  ],
  confidentialityRiskProbability: [
    { value: 'rare', label: 'Rare' },
    { value: 'unlikely', label: 'Unlikely' },
    { value: 'possible', label: 'Possible' },
    { value: 'probable', label: 'Probable' },
    { value: 'severe', label: 'Severe' },
  ],
  confidentialityRiskSecurity: [
    {
      value: 'insignificant',
      label: `Insignificant: The loss of confidentiality and integrity of personal data, where processing has minimal operational impact and negligible costs, and does not notably affect the data subject's business or finances.`,
    },
    {
      value: 'minor',
      label: `Minor: The loss of confidentiality and integrity of personal data, where processing has a noticeable but limited operational impact, some costs, and may lead to a minor financial impact for the data subject, but is unlikely to significantly affect their rights.`,
    },
    {
      value: 'moderate',
      label: `Moderate: The loss of confidentiality and integrity of personal data, where processing has a substantial operational impact, very costly, and may cause considerable business or financial harm to the data subject, but does not involve special categories or sensitive data with a major rights impact.`,
    },
    {
      value: 'major',
      label: `Major: The loss of confidentiality and integrity of personal data, where processing causes severe operational disruption, highly damaging and extremely costly to both the organization and data subjects. It could involve special categories (like criminal history or sensitive data), leading to significant risks to the rights and freedoms of data subjects.`,
    },
    {
      value: 'extreme',
      label: `Extreme: The loss of confidentiality and integrity of personal data, where processing results in complete operational failure and is unsurvivable, with potential life-threatening consequences or severe impacts on personal freedoms and rights of the data subjects.`,
    },
  ],
  availabilityRiskProbability: [
    { value: 'rare', label: 'Rare' },
    { value: 'unlikely', label: 'Unlikely' },
    { value: 'possible', label: 'Possible' },
    { value: 'probable', label: 'Probable' },
    { value: 'severe', label: 'Severe' },
  ],
  availabilityRiskSecurity: [
    {
      value: 'insignificant',
      label:
        "Insignificant: The loss of availability of personal data, where processing has minimal operational impact and negligible costs, and does not notably affect the data subject's business or finances.",
    },
    {
      value: 'minor',
      label:
        'Minor: The loss of availability of personal data, where processing has a noticeable but limited operational impact, some costs, and may lead to minor financial inconvenience for the data subject, but without substantial impact on their rights.',
    },
    {
      value: 'moderate',
      label:
        'Moderate: The loss of availability of personal data, where processing causes a substantial operational impact, is very costly, and leads to significant business or financial harm for the data subject, but does not involve sensitive categories that pose a major risk to their rights.',
    },
    {
      value: 'major',
      label:
        "Major: The loss of availability of personal data, where processing results in severe operational disruption, is highly damaging and extremely costly, and could involve special categories (e.g., criminal histories or sensitive data), potentially leading to considerable risks to the data subject's rights and freedoms.",
    },
    {
      value: 'extreme',
      label:
        'Extreme: The loss of availability of personal data, where processing causes complete operational failure, with potentially life-threatening consequences or severe impacts on personal freedoms and rights of the data subjects.',
    },
  ],
  transparencyRiskProbability: [
    { value: 'rare', label: 'Rare' },
    { value: 'unlikely', label: 'Unlikely' },
    { value: 'possible', label: 'Possible' },
    { value: 'probable', label: 'Probable' },
    { value: 'severe', label: 'Severe' },
  ],
  transparencyRiskSecurity: [
    {
      value: 'insignificant',
      label:
        "Insignificant: The loss of transparency, appropriateness, and data minimization in processing personal data, where it has minimal operational impact, negligible costs, and does not notably affect the data subject's business or finances.",
    },
    {
      value: 'minor',
      label:
        'Minor: The loss of transparency, appropriateness, and data minimization in processing personal data, where it has a noticeable but limited operational impact, some costs, and may lead to minor financial consequences for the data subject, but without a substantial impact on their rights.',
    },
    {
      value: 'moderate',
      label:
        'Moderate: The loss of transparency, appropriateness, and data minimization in processing personal data, where it results in substantial operational impact, is very costly, and may cause significant business or financial harm to the data subject, but without involving special categories that pose major risks to their rights.',
    },
    {
      value: 'major',
      label:
        "Major: The loss of transparency, appropriateness, and data minimization in processing personal data, where it causes severe operational disruption, is highly damaging and extremely costly. It may involve special categories (e.g., sensitive data or criminal histories), with a potential for significant risks to the data subject's rights and freedoms.",
    },
    {
      value: 'extreme',
      label:
        'Extreme: The loss of transparency, appropriateness, and data minimization in processing personal data, where it leads to complete operational failure, posing potential threats to life or personal freedoms, with serious impacts on the rights of data subjects.',
    },
  ],
  dealingWithResidualRisk: [
    { value: 'acceptable', label: 'Acceptable' },
    {
      value: 'acceptable_with_conditions',
      label: 'Acceptable with limitations under certain conditions',
    },
    { value: 'not_acceptable', label: 'Not acceptable' },
  ],
  supervisoryAuthorityInvolvement: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ],
};

export const computeRiskMap = (
  tasks: Task[],
  riskKey: number,
  keys: { security: string; probability: string }
): Map<string, number> | null => {
  if (!tasks) return null;

  const riskMap = new Map<string, number>();

  tasks
    .filter((task) => (task.properties as TaskProperties)?.pia_risk)
    .map((task) => (task.properties as TaskProperties)?.pia_risk)
    .forEach((risk) => {
      const security = risk?.[riskKey]?.[keys.security];
      const probability = risk?.[riskKey]?.[keys.probability];

      if (!security || !probability) return;

      const x = riskSecurityPoints[security];
      const y = riskProbabilityPoints[probability];
      const key = `${x},${y}`;

      riskMap.set(key, (riskMap.get(key) || 0) + 1);
    });

  return riskMap;
};

export const generateChangeLog = (
  actor: AuditLog['actor'],
  event: string,
  diffLog: Diff
): AuditLog => {
  return {
    actor,
    date: new Date().getTime(),
    event,
    diff: diffLog,
  };
};

const reduceMultipleObj = (
  acc: Record<string, any>,
  x: Record<string, any>
) => {
  for (const key in x) acc[key] = x?.[key];
  return acc;
};

export const getDiff = (o1: any, o2: any) => {
  const prev = o1.reduce(reduceMultipleObj, {});
  const next = o2.reduce(reduceMultipleObj, {});
  const diff: Diff[] = [];
  for (const [key, value] of Object.entries(fieldPropsMapping)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      let prevValue;
      let nextValue;
      if (configWithLabels[key as keyof PiaConfig] != null) {
        if (Array.isArray(prev[key]) || Array.isArray(next[key])) {
          prevValue = prev[key].map(
            ({ value }: Option) =>
              configWithLabels[key as keyof PiaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
          nextValue = next[key].map(
            ({ value }: Option) =>
              configWithLabels[key as keyof PiaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
        } else {
          prevValue = configWithLabels[key as keyof PiaConfig]?.find(
            (option) =>
              option.value ===
              (typeof prev[key] === 'string' ? prev[key] : prev[key]?.value)
          )?.label;
          nextValue = configWithLabels[key as keyof PiaConfig]?.find(
            (option) =>
              option.value ===
              (typeof next[key] === 'string' ? next[key] : next[key]?.value)
          )?.label;
        }
      } else {
        prevValue = prev[key];
        nextValue = next[key];
      }
      diff.push({
        field: value,
        prevValue: JSON.stringify(prevValue),
        nextValue: JSON.stringify(nextValue),
      });
    }
  }

  return diff;
};
