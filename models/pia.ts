import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { Task } from '@prisma/client';
import { riskProbabilityPoints, riskSecurityPoints } from '@/lib/pia';
import type {
  AuditLog,
  Diff,
  PiaConfig,
  PiaRisk,
  TaskProperties,
  Option,
} from 'types';

export const saveRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: PiaRisk | [];
  nextRisk: PiaRisk | [];
}) => {
  const { user, taskNumber, slug, prevRisk, nextRisk } = params;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  taskProperties.pia_risk = nextRisk;

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevRisk,
    nextRisk,
  });

  return updatedTask;
};

export const deleteRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: PiaRisk | [];
  nextRisk: PiaRisk | [];
}) => {
  const { taskNumber, slug, user, prevRisk, nextRisk } = params;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  delete taskProperties.pia_risk;

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevRisk,
    nextRisk,
  });

  return updatedTask;
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

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: TaskProperties;
  user: Session['user'];
  prevRisk: PiaRisk | [];
  nextRisk: PiaRisk | [];
}) => {
  const { taskId, taskProperties, user, prevRisk, nextRisk } = params;
  const newAuditItems: AuditLog[] = [];

  if (prevRisk.length === 0 && nextRisk.length !== 0) {
    newAuditItems.push(generateChangeLog(user, 'created', null));
  } else if (nextRisk.length === 0) {
    newAuditItems.push(generateChangeLog(user, 'deleted', null));
  } else {
    const diff = prevRisk.length === 0 ? [] : getDiff(prevRisk, nextRisk);
    newAuditItems.push(
      ...diff.map((changeLog) => {
        return generateChangeLog(user, 'updated', changeLog);
      })
    );
  }

  let pia_audit_logs = taskProperties?.pia_audit_logs;

  if (typeof pia_audit_logs === 'undefined') {
    pia_audit_logs = [...newAuditItems];
  } else {
    pia_audit_logs = [...pia_audit_logs, ...newAuditItems];
  }

  taskProperties.pia_audit_logs = pia_audit_logs;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });
};

const generateChangeLog = (
  user: Session['user'],
  event: string,
  diffLog: Diff
): AuditLog => {
  return {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: diffLog,
  };
};

const reduceMultipleObj = (acc, x) => {
  for (const key in x) acc[key] = x?.[key];
  return acc;
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

export const config: PiaConfig = {
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

export const getDiff = (o1, o2) => {
  const prev = o1.reduce(reduceMultipleObj, {});
  const next = o2.reduce(reduceMultipleObj, {});
  const diff: Diff[] = [];
  for (const [key, value] of Object.entries(fieldPropsMapping)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      let prevValue, nextValue;
      if (config[key as keyof PiaConfig] != null) {
        if (Array.isArray(prev[key]) || Array.isArray(next[key])) {
          prevValue = prev[key].map(
            ({ value }: Option) =>
              config[key as keyof PiaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
          nextValue = next[key].map(
            ({ value }: Option) =>
              config[key as keyof PiaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
        } else {
          prevValue = config[key as keyof PiaConfig]?.find(
            (option) =>
              option.value ===
              (typeof prev[key] === 'string' ? prev[key] : prev[key]?.value)
          )?.label;
          nextValue = config[key as keyof PiaConfig]?.find(
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
