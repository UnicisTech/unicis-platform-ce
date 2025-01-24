import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { Task } from '@prisma/client';
import { riskSecurityPoints, riskProbabilityPoints } from '@/components/defaultLanding/data/configs/pia';
import type { AuditLog, Diff, PiaConfig, PiaRisk, TaskProperties } from "types";
import { fieldPropsMapping, config } from '@/components/defaultLanding/data/configs/pia';

type Option = {
  label: string,
  value: string,
}

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
      .filter(task => (task.properties as TaskProperties)?.pia_risk)
      .map(task => (task.properties as TaskProperties)?.pia_risk)
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
    const diff =
    prevRisk.length === 0 ? [] : getDiff(prevRisk, nextRisk);
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