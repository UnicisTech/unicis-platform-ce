import { controls } from "@/components/interfaces/CSC/config";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import { RpaProcedureInterface, RpaOption } from "types";
import { config, fieldPropsMapping } from "data/configs/rpa";
import { RpaConfig } from "types";

export const saveProcedure = async (params: {
  user: Session["user"];
  taskId: number;
  prevProcedure: RpaProcedureInterface | [];
  nextProcedure: RpaProcedureInterface | [];
}) => {
  const { user, taskId, prevProcedure, nextProcedure } = params;
  //console.log('rpa save:', {prevProcedure, nextProcedure})
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });

  const taskProperties = task?.properties as any;
  taskProperties.rpa_procedure = nextProcedure;

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

  console.log("saveProcudure finishied in lib");

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevProcedure,
    nextProcedure,
  });

  console.log("after addAuditLogs");
};

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: any;
  user: Session["user"];
  prevProcedure: RpaProcedureInterface | [];
  nextProcedure: RpaProcedureInterface | [];
}) => {
  const { taskId, taskProperties, user, prevProcedure, nextProcedure } = params;
  const newAuditItems = [];

  if (prevProcedure.length === 0 && nextProcedure.length !== 0) {
    newAuditItems.push(generateChangeLog(user, "created", null));
  } else if (nextProcedure.length === 0) {
    newAuditItems.push(generateChangeLog(user, "deleted", null));
  } else {
    const diff =
      prevProcedure.length === 0 ? [] : getDiff(prevProcedure, nextProcedure);
    newAuditItems.push(
      ...diff.map((changeLog) => {
        return generateChangeLog(user, "updated", changeLog);
      })
    );
  }

  console.log("newAuditItems -->", newAuditItems);

  let rpa_audit_logs = taskProperties?.rpa_audit_logs;

  if (typeof rpa_audit_logs === "undefined") {
    rpa_audit_logs = [...newAuditItems];
  } else {
    rpa_audit_logs = [...rpa_audit_logs, ...newAuditItems];
  }

  taskProperties.rpa_audit_logs = rpa_audit_logs;

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

// export const addAuditLog = async (issueKey, userId, prevProcedure, nextProcedure) => {
//   const auditLog = await getAuditLog(issueKey);
//   const newAuditItems = [];

//   if (prevProcedure.length === 0 && nextProcedure.length !== 0) {
//     newAuditItems.push(generateChangeLog(userId, "created", null));
//   } else if(nextProcedure.length === 0)  {
//     newAuditItems.push(generateChangeLog(userId, "deleted", null));
//   } else {
//     const diff = prevProcedure.length === 0 ? null : getDiff(prevProcedure, nextProcedure);
//     newAuditItems.push(...diff.map(changeLog => {
//       return generateChangeLog(userId, "updated", changeLog);
//     }));
//   }

//   await properties.onJiraIssue(issueKey).set(prefix + "auditLog", [...auditLog, ...newAuditItems]);
// }

export const addAuditLog = async (params: {
  taskId: number;
  user: Session["user"];
  event: string;
  prevValue: string | null;
  nextValue: string;
  taskProperties: any;
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

  if (typeof csc_audit_logs === "undefined") {
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

const generateChangeLog = (
  user: Session["user"],
  event: string,
  diffLog: any
) => {
  return {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: diffLog,
  };
};

const reduceMultipleObj = (acc: any, x: any) => {
  for (const key in x) acc[key] = x?.[key];
  return acc;
};

export const getDiff = (o1: any, o2: any) => {
  const prev = o1.reduce(reduceMultipleObj, {});
  const next = o2.reduce(reduceMultipleObj, {});
  const diff = [];
  for (const [key, value] of Object.entries(fieldPropsMapping)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      let prevValue, nextValue;
      if (config[key as keyof RpaConfig] != null) {
        if (Array.isArray(prev[key]) || Array.isArray(next[key])) {
          //console.log('1?', key)
          prevValue = prev[key].map(
            ({ value }: RpaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
          nextValue = next[key].map(
            ({ value }: RpaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
        } else {
          //console.log('2?', key)
          prevValue = config[key as keyof RpaConfig]?.find(
            (option) => option.value === prev[key]?.value
          )?.label;
          nextValue = config[key as keyof RpaConfig]?.find(
            (option) => option.value === next[key]?.value
          )?.label;
        }
      } else {
        //console.log('3?')
        prevValue = prev[key];
        nextValue = next[key];
      }
      diff.push({
        field: value,
        prevValue: prevValue,
        nextValue: nextValue,
      });
    }
  }

  return diff;
};
