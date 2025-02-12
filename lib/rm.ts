import { prisma } from '@/lib/prisma';
import type { Task } from '@prisma/client';
import type { Session } from 'next-auth';
import type {
  RMProcedureInterface,
  TaskProperties,
  AuditLog,
  Diff,
} from 'types';
import {
  fieldPropsMapping,
  config,
} from '@/components/defaultLanding/data/configs/rm';

//TODO: no need config at all for Rm
type RmConfig = any;

type Option = {
  label: string;
  value: string;
};

export const saveRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: RMProcedureInterface | [];
  nextRisk: RMProcedureInterface | [];
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
  taskProperties.rm_risk = nextRisk;

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
  prevRisk: RMProcedureInterface | [];
  nextRisk: RMProcedureInterface | [];
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
  delete taskProperties.rm_risk;

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

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: TaskProperties;
  user: Session['user'];
  prevRisk: RMProcedureInterface | [];
  nextRisk: RMProcedureInterface | [];
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

  let rm_audit_logs = taskProperties?.rm_audit_logs;

  if (typeof rm_audit_logs === 'undefined') {
    rm_audit_logs = [...newAuditItems];
  } else {
    rm_audit_logs = [...rm_audit_logs, ...newAuditItems];
  }

  taskProperties.rm_audit_logs = rm_audit_logs;

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

export const getDiff = (o1, o2) => {
  const prev = o1.reduce(reduceMultipleObj, {});
  const next = o2.reduce(reduceMultipleObj, {});
  const diff: Diff[] = [];
  for (const [key, value] of Object.entries(fieldPropsMapping)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      let prevValue, nextValue;
      if (config[key as keyof RmConfig] != null) {
        if (Array.isArray(prev[key]) || Array.isArray(next[key])) {
          prevValue = prev[key].map(
            ({ value }: Option) =>
              config[key as keyof RmConfig]?.find(
                (option) => option.value === value
              )?.label
          );
          nextValue = next[key].map(
            ({ value }: Option) =>
              config[key as keyof RmConfig]?.find(
                (option) => option.value === value
              )?.label
          );
        } else {
          prevValue = config[key as keyof RmConfig]?.find(
            (option) =>
              option.value ===
              (typeof prev[key] === 'string' ? prev[key] : prev[key]?.value)
          )?.label;
          nextValue = config[key as keyof RmConfig]?.find(
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

const transformToRange = (value: number): number => {
  return Math.floor(value / 20);
};

export const calculateRiskRating = (probability: number, impact: number) => {
  const result = (probability / 100) * (impact / 100);
  return Math.floor(result * 100);
};

export const calculateCurrentRiskRating = (
  rawRiskRating: number,
  targetRiskRating: number,
  treatmentStatus: number
) => {
  const decimalTreatmentStatus = treatmentStatus / 100; // 50% -> 0.5
  const result =
    rawRiskRating - decimalTreatmentStatus * (rawRiskRating - targetRiskRating);
  return Math.floor(result);
};

export const computeRiskMap = (tasks: Task[]): Map<string, number> | null => {
  if (!tasks) return null;

  const riskMap = new Map<string, number>();

  tasks
    .filter((task) => (task.properties as TaskProperties)?.rm_risk)
    .map((task) => (task.properties as TaskProperties)?.rm_risk)
    .forEach((risk) => {
      const security = risk?.[1]?.['TreatedImpact'] as number;
      const probability = risk?.[1]?.['TreatedProbability'] as number;

      if (!security || !probability) return;

      const x = transformToRange(security);
      const y = transformToRange(probability);

      const key = `${x},${y}`;

      riskMap.set(key, (riskMap.get(key) || 0) + 1);
    });

  return riskMap;
};

export const calculateRiskDistribution = (tasks: Task[]): number[] => {
  const riskCounts = [0, 0, 0, 0, 0];

  tasks.forEach((task) => {
    const risk = (task.properties as TaskProperties).rm_risk as
      | RMProcedureInterface
      | undefined;
    if (!risk) {
      return;
    }
    const rawRiskRating = calculateRiskRating(
      risk[0].RawProbability,
      risk[0].RawImpact
    );
    const targetRiskRating = calculateRiskRating(
      risk[1].TreatedProbability,
      risk[1].TreatedImpact
    );
    const currentRiskRating = calculateCurrentRiskRating(
      rawRiskRating,
      targetRiskRating,
      risk[1].TreatmentStatus
    );

    if (currentRiskRating >= 0 && currentRiskRating < 20) {
      riskCounts[0] += 1; // 0-20%
    } else if (currentRiskRating >= 20 && currentRiskRating < 40) {
      riskCounts[1] += 1; // 20-40%
    } else if (currentRiskRating >= 40 && currentRiskRating < 60) {
      riskCounts[2] += 1; // 40-60%
    } else if (currentRiskRating >= 60 && currentRiskRating < 80) {
      riskCounts[3] += 1; // 60-80%
    } else if (currentRiskRating >= 80 && currentRiskRating <= 100) {
      riskCounts[4] += 1; // 80-100%
    }
  });

  return riskCounts;
};

export const getInitials = (name: string) => {
  const words = name.trim().split(' ');

  const initials = words
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join('');

  return initials;
};

export const riskValueToLabel = (value: number): string => {
  const riskLevels = [
    { max: 20, label: 'Insignificant' },
    { max: 40, label: 'Minor' },
    { max: 60, label: 'Moderate' },
    { max: 80, label: 'Major' },
    { max: 100, label: 'Extreme' },
  ];

  for (const { max, label: riskLabel } of riskLevels) {
    if (value <= max) {
      return riskLabel;
    }
  }

  return '';
};
