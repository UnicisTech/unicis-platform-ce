import { prisma } from '@/lib/prisma';
import { getCscControlsProp } from '@/lib/csc';
import type { Session } from 'next-auth';
import type { CscAuditLog, ISO } from 'types';
import {
  appendTaskAuditLogs,
  getCscControls,
  setTaskProperty,
} from '@/lib/properties';

export const addControlsToIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;
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

  const cscControlsProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const existingControls = getCscControls(task.properties, ISO);
  const taskProperties = setTaskProperty(task.properties, cscControlsProp, [
    ...existingControls,
    ...controls,
  ]);

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: taskProperties,
    },
  });
  let propertiesWithAuditLogs = taskProperties;
  for (const control of controls) {
    propertiesWithAuditLogs = await addAuditLog({
      taskId,
      user,
      event: 'added',
      prevValue: null,
      nextValue: control,
      taskProperties: propertiesWithAuditLogs,
    });
  }
};

export const removeControlsFromIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;
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

  const cscControlsProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const existingControls = getCscControls(task.properties, ISO);
  const nextControls = existingControls.filter(
    (item) => !controls.includes(item)
  );
  const taskProperties = setTaskProperty(
    task.properties,
    cscControlsProp,
    nextControls
  );

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: taskProperties,
    },
  });
  let propertiesWithAuditLogs = taskProperties;
  for (const control of controls) {
    propertiesWithAuditLogs = await addAuditLog({
      taskId,
      user,
      event: 'removed',
      prevValue: null,
      nextValue: control,
      taskProperties: propertiesWithAuditLogs,
    });
  }
};

export const changeControlInIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;
  const [oldControl, newControl] = controls;
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

  const cscControlsProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const existingControls = getCscControls(task.properties, ISO);

  const nextControls = existingControls.map((control) => {
    if (control === oldControl) {
      return newControl;
    } else {
      return control;
    }
  });

  const taskProperties = setTaskProperty(
    task.properties,
    cscControlsProp,
    nextControls
  );

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: taskProperties,
    },
  });
  await addAuditLog({
    taskId,
    user,
    event: 'changed',
    prevValue: oldControl,
    nextValue: newControl,
    taskProperties,
  });
};

const addAuditLog = async (params: {
  taskId: number;
  user: Session['user'];
  event: string;
  prevValue: string | null;
  nextValue: string;
  taskProperties: unknown;
}) => {
  const { taskId, user, event, prevValue, nextValue, taskProperties } = params;

  const auditLog: CscAuditLog = {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: {
      prevValue: prevValue,
      nextValue: nextValue,
    },
  };

  const updatedProperties = appendTaskAuditLogs(
    taskProperties,
    'csc_audit_logs',
    [auditLog]
  );

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: updatedProperties,
    },
  });

  return updatedProperties;
};
