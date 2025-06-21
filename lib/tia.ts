import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/tia';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { TiaOption, TiaProcedureInterface, TaskProperties } from 'types';
import { TiaAuditLog, RpaConfig, Diff } from 'types';

export const deleteProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevProcedure: TiaProcedureInterface | [];
  nextProcedure: TiaProcedureInterface | [];
}) => {
  const { user, taskNumber, slug, prevProcedure, nextProcedure } = params;
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
  delete taskProperties.tia_procedure;

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
    prevProcedure,
    nextProcedure,
  });

  return updatedTask;
};

export const saveProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevProcedure: TiaProcedureInterface | [];
  nextProcedure: TiaProcedureInterface | [];
}) => {
  const { user, taskNumber, slug, prevProcedure, nextProcedure } = params;
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
  taskProperties.tia_procedure = nextProcedure;

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
    prevProcedure,
    nextProcedure,
  });

  return updatedTask;
};

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: TaskProperties;
  user: Session['user'];
  prevProcedure: TiaProcedureInterface | [];
  nextProcedure: TiaProcedureInterface | [];
}) => {
  const { taskId, taskProperties, user, prevProcedure, nextProcedure } = params;
  const newAuditItems: TiaAuditLog[] = [];

  if (prevProcedure.length === 0 && nextProcedure.length !== 0) {
    newAuditItems.push(generateChangeLog(user, 'created', null));
  } else if (nextProcedure.length === 0) {
    newAuditItems.push(generateChangeLog(user, 'deleted', null));
  } else {
    const diff =
      prevProcedure.length === 0 ? [] : getDiff(prevProcedure, nextProcedure);
    newAuditItems.push(
      ...diff.map((changeLog) => {
        return generateChangeLog(user, 'updated', changeLog);
      })
    );
  }

  let tia_audit_logs = taskProperties?.tia_audit_logs;

  if (typeof tia_audit_logs === 'undefined') {
    tia_audit_logs = [...newAuditItems];
  } else {
    tia_audit_logs = [...tia_audit_logs, ...newAuditItems];
  }

  taskProperties.tia_audit_logs = tia_audit_logs;

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
): TiaAuditLog => {
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
      if (config[key as keyof RpaConfig] != null) {
        if (Array.isArray(prev[key]) || Array.isArray(next[key])) {
          prevValue = prev[key].map(
            ({ value }: TiaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
          nextValue = next[key].map(
            ({ value }: TiaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
        } else {
          prevValue = config[key as keyof RpaConfig]?.find(
            (option) =>
              option.value ===
              (typeof prev[key] === 'string' ? prev[key] : prev[key]?.value)
          )?.label;
          nextValue = config[key as keyof RpaConfig]?.find(
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
        prevValue: prevValue,
        nextValue: nextValue,
      });
    }
  }

  return diff;
};

export const shouldSkipTwoSteps = (formData: any) =>
  [
    'LawfulAccess',
    'MassSurveillanceTelecommunications',
    'SelfReportingObligations',
  ]
    .map((prop) => ['yes', 'na'].includes(formData[prop]))
    .every((result) => result === true);

export const isTranferPermitted = (procedure: any): boolean => {
  if (!procedure[1]) return false;

  const {
    EncryptionInTransit,
    TransferMechanism,
    LawfulAccess,
    MassSurveillanceTelecommunications,
    SelfReportingObligations,
  } = procedure[1];

  const {
    ConnectionTargetedAccess,
    ConnectionSurveillanceTele,
    ConnectionSelfreportingObligations,
  } = procedure[3];

  if (EncryptionInTransit === 'no' || TransferMechanism === 'no') {
    return false;
  }

  if (LawfulAccess === 'no' && ConnectionTargetedAccess === 'yes') {
    return false;
  }

  if (
    MassSurveillanceTelecommunications === 'no' &&
    ConnectionSurveillanceTele === 'yes'
  ) {
    return false;
  }

  if (
    SelfReportingObligations === 'no' &&
    ConnectionSelfreportingObligations === 'yes'
  ) {
    return false;
  }

  return true;
};

export const getTransferIsValue = (formData: any) => {
  //TODO: remove legacy verison
  if (!formData) return 'NOT PERMITTED';

  //legacy version is formData.values
  const {
    EncryptionInTransit,
    TransferMechanism,
    LawfulAccess,
    MassSurveillanceTelecommunications,
    SelfReportingObligations,
  } = formData.values || formData;

  if (EncryptionInTransit === 'no' || TransferMechanism === 'no') {
    return 'NOT PERMITTED';
  }

  if (
    LawfulAccess === 'no' ||
    MassSurveillanceTelecommunications === 'no' ||
    SelfReportingObligations === 'no'
  ) {
    return 'PERMITTED, SUBJECT TO STEP 4';
  }

  return 'PERMITTED';
};

export const getTiaRisks = (state) => {
  //TODO: remove legacy version
  if (!state) {
    return {
      targetedRisk: 0,
      nonTargetedRisk: 0,
      selfReportingRisk: 0,
    };
  }

  const {
    WarrantsSubpoenas,
    ViolationLocalLaw,
    HighViolationLocalLaw,
    HighViolationDataIssue,
    InvestigatingImporter,
    PastWarrantSubpoena,
    LocalIssueWarrants,
    LocalMassSurveillance,
    LocalAccessMassSurveillance,
    LocalRoutinelyMonitor,
    PassMassSurveillance,
    ImporterObligation,
    LocalSelfReporting,
    PastSelfReporting,
  } = state || state.values;

  const targetedRisk =
    Number(WarrantsSubpoenas) +
    Number(ViolationLocalLaw) +
    Number(HighViolationLocalLaw) +
    Number(HighViolationDataIssue) +
    Number(InvestigatingImporter) +
    Number(PastWarrantSubpoena);

  const nonTargetedRisk =
    Number(LocalIssueWarrants) +
    Number(LocalMassSurveillance) +
    Number(LocalAccessMassSurveillance) +
    Number(LocalRoutinelyMonitor) +
    Number(PassMassSurveillance);

  const selfReportingRisk =
    Number(ImporterObligation) +
    Number(LocalSelfReporting) +
    Number(PastSelfReporting);

  return { targetedRisk, nonTargetedRisk, selfReportingRisk };
};

export const getProblematicLawfulAccesses = (formState: any) => {
  //TODO: remove legacy version
  // const formData = formState?.values;
  const formData = formState;

  if (!formData) {
    return {
      isDataIssueInvestigationEqualToTwo: false,
      isPassMassSurveillanceConnectionEqualToFour: false,
      isAssessmentProduceReportEqualToFour: false,
    };
  }

  const isDataIssueInvestigationProblematic =
    formData.DataIssueInvestigation === '2';
  const isPassMassSurveillanceConnectionProblematic =
    formData.PassMassSurveillanceConnection === '4';
  const isAssessmentProduceReportProblematic =
    formData.AssessmentProduceReport === '4';

  return {
    isDataIssueInvestigationProblematic,
    isPassMassSurveillanceConnectionProblematic,
    isAssessmentProduceReportProblematic,
  };
};
