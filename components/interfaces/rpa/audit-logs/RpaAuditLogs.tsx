import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task } from 'types';
import type { RpaAuditLog } from 'types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import Pagination from '@/components/shadcn/ui/audit-pagination';
import { Error, Loading, MemberName } from '@/components/shared';
import useTeamMembersMap from 'hooks/useTeamMembersMap';
import { auditLogHelper } from './auditLogHelper';

const LOGS_PER_PAGE = 20;

const RpaAuditLogs = ({ task, slug }: { task: Task; slug: string }) => {
  const { t } = useTranslation('common');

  const taskProperties = task?.properties as any;
  const auditLogs = (taskProperties.rpa_audit_logs || []) as RpaAuditLog[];

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(auditLogs.length / LOGS_PER_PAGE);
  const start = (page - 1) * LOGS_PER_PAGE;
  const paginatedLogs = [...auditLogs]
    .reverse()
    .slice(start, start + LOGS_PER_PAGE);

  const { isLoading, isError, membersById } = useTeamMembersMap(slug);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError?.message} />;
  }

  return (
    <div className="space-y-4">
      {auditLogs.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('action')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('prev-value')}</TableHead>
                <TableHead>{t('next-value')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <MemberName
                      membersById={membersById}
                      userId={log.actor?.id}
                      fallback="—"
                    />
                  </TableCell>
                  <TableCell>{t(`${log.event}`)}</TableCell>
                  <TableCell>
                    {new Date(log.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {auditLogHelper(
                      log.diff?.field,
                      log.diff?.prevValue,
                      t,
                      membersById
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {auditLogHelper(
                      log.diff?.field,
                      log.diff?.nextValue,
                      t,
                      membersById
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination
              page={page}
              onChange={setPage}
              totalPages={totalPages}
            />
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('no-logs-available')}
        </p>
      )}
    </div>
  );
};

export default RpaAuditLogs;
