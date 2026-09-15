import React from 'react';
import { useTranslation } from 'next-i18next';
import type { Task } from 'types';
import {
  AuditTimeline,
  type TimelineLog,
} from '@/components/interfaces/Task/AuditTimeline';
import { getCscAuditLogs } from '@/lib/properties';

const CscAuditLogs = ({ task }: { task: Task }) => {
  const { t } = useTranslation('common');

  const auditLogs = getCscAuditLogs(task.properties);

  // Normalise CscAuditLog to the shared TimelineLog shape
  const logs: TimelineLog[] = auditLogs.map((log) => ({
    date: log.date,
    actor: log.actor as TimelineLog['actor'],
    event: log.event,
    diff: log.diff
      ? {
          prevValue: log.diff.prevValue ?? null,
          nextValue: log.diff.nextValue ?? null,
        }
      : null,
  }));

  return (
    <AuditTimeline
      logs={logs}
      translateEvent={(event) => {
        const key = `task-audit.event-${event}`;
        const tr = t(key);
        return tr !== key ? tr : event;
      }}
    />
  );
};

export default CscAuditLogs;
