import React from 'react';
import { useTranslation } from 'next-i18next';
import type { Task } from 'types';
import type { RpaAuditLog } from 'types';
import {
  AuditTimeline,
  type TimelineLog,
} from '@/components/interfaces/Task/AuditTimeline';
import { Error, Loading } from '@/components/shared';
import useTeamMembersMap from 'hooks/useTeamMembersMap';
import { auditLogHelper } from './auditLogHelper';

const RpaAuditLogs = ({ task, slug }: { task: Task; slug: string }) => {
  const { t } = useTranslation('common');

  const taskProperties = task?.properties as any;
  const auditLogs = (taskProperties.rpa_audit_logs || []) as RpaAuditLog[];

  const { isLoading, isError, membersById } = useTeamMembersMap(slug);

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError?.message} />;

  const logs: TimelineLog[] = auditLogs.map((log) => ({
    date: log.date,
    actor: log.actor as TimelineLog['actor'],
    event: log.event,
    diff: log.diff
      ? {
          field: log.diff.field,
          prevValue: log.diff.prevValue as string | string[] | undefined,
          nextValue: log.diff.nextValue as string | string[],
        }
      : null,
  }));

  return (
    <AuditTimeline
      logs={logs}
      membersById={membersById}
      translateEvent={(event) => {
        const tr = t(event);
        return tr !== event ? tr : event;
      }}
      translateField={(field) => field}
      renderDiff={(log) => {
        if (!log.diff) return null;
        const { field, prevValue, nextValue } = log.diff;
        const hasPrev = prevValue !== undefined && prevValue !== null;
        const hasNext = nextValue !== undefined && nextValue !== null;
        if (!hasPrev && !hasNext) return null;
        return (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {hasPrev && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium line-through">
                {auditLogHelper(field, prevValue, t, membersById)}
              </span>
            )}
            {hasPrev && hasNext && (
              <span className="text-slate-400 text-[11px]">→</span>
            )}
            {hasNext && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
                {auditLogHelper(field, nextValue, t, membersById)}
              </span>
            )}
          </div>
        );
      }}
    />
  );
};

export default RpaAuditLogs;
