import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type {
  ISO,
  CscStatusesProp,
  CscControlsProp,
  TaskProperties,
} from 'types';

export const getCscControlsProp = (ISO: ISO): CscControlsProp => {
  const cscStatusesProp = `csc_controls${
    ISO !== 'default' ? `_${ISO}` : ''
  }` as CscControlsProp;
  return cscStatusesProp;
};

export const getCscStatusesProp = (ISO: ISO): CscStatusesProp => {
  const cscStatusesProp = `csc_statuses${
    ISO !== 'default' ? `_${ISO}` : ''
  }` as CscStatusesProp;
  return cscStatusesProp;
};

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

  const cscStatusesProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  let csc_controls = taskProperties?.[cscStatusesProp];

  if (typeof csc_controls === 'undefined') {
    csc_controls = [...controls];
  } else {
    csc_controls = [...csc_controls, ...controls];
  }
  taskProperties[cscStatusesProp] = csc_controls;

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
  for (const control of controls) {
    await addAuditLog({
      taskId,
      user,
      event: 'added',
      prevValue: null,
      nextValue: control,
      taskProperties,
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

  const cscStatusesProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  const csc_controls = taskProperties?.[cscStatusesProp] as Array<string>;
  const new_csc_controls = csc_controls.filter(
    (item) => !controls.includes(item)
  );
  taskProperties[cscStatusesProp] = new_csc_controls;

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
  for (const control of controls) {
    await addAuditLog({
      taskId,
      user,
      event: 'removed',
      prevValue: null,
      nextValue: control,
      taskProperties,
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

  const cscStatusesProp = getCscControlsProp(ISO);
  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  const csc_controls = taskProperties?.[cscStatusesProp] as Array<string>;

  const new_csc_controls = csc_controls.map((control) => {
    if (control === oldControl) {
      return newControl;
    } else {
      return control;
    }
  });

  taskProperties[cscStatusesProp] = new_csc_controls;

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
  await addAuditLog({
    taskId,
    user,
    event: 'changed',
    prevValue: oldControl,
    nextValue: newControl,
    taskProperties,
  });
};

export const addAuditLog = async (params: {
  taskId: number;
  user: Session['user'];
  event: string;
  prevValue: string | null;
  nextValue: string;
  taskProperties: TaskProperties;
}) => {
  const { taskId, user, event, prevValue, nextValue, taskProperties } = params;

  const auditLog = {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: {
      prevValue: prevValue,
      nextValue: nextValue,
    },
  };

  let csc_audit_logs = taskProperties?.csc_audit_logs;

  if (typeof csc_audit_logs === 'undefined') {
    csc_audit_logs = [auditLog];
  } else {
    csc_audit_logs = [...csc_audit_logs, auditLog];
  }

  taskProperties.csc_audit_logs = csc_audit_logs;

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
