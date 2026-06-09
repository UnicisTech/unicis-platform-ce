import React from 'react';
import { useTranslation } from 'next-i18next';
import type { Task, AuditLog } from 'types';
import { AuditTimeline, type TimelineLog } from '@/components/interfaces/Task/AuditTimeline';

const PiaAuditLogs = ({ task }: { task: Task }) => {
  const { t } = useTranslation('common');

  const taskProperties = task?.properties as any;
  const auditLogs = (taskProperties?.pia_audit_logs || []) as AuditLog[];

  const logs: TimelineLog[] = auditLogs.map((log) => ({
    date: log.date,
    actor: log.actor as TimelineLog['actor'],
    event: log.event,
    diff: log.diff
      ? {
          field: log.diff.field,
          prevValue: log.diff.prevValue,
          nextValue: log.diff.nextValue,
        }
      : null,
  }));

  return (
    <AuditTimeline
      logs={logs}
      translateEvent={(event) => {
        const tr = t(event);
        return tr !== event ? tr : event;
      }}
      translateField={(field) => field}
    />
  );
};

export default PiaAuditLogs;
