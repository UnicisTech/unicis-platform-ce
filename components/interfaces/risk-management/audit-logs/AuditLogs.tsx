import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task } from '@prisma/client';
import type { AuditLog } from 'types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import Pagination from '@/components/shadcn/ui/audit-pagination';
import useTeamMembersMap from 'hooks/useTeamMembersMap';
import { Error, Loading, MemberName } from '@/components/shared';
import { auditLogHelper } from './auditLogHelper';

const ITEMS_PER_PAGE = 20;

const AuditLogs = ({ task, slug }: { task: Task, slug: string }) => {
  const { t } = useTranslation('common');

  const taskProperties = task?.properties as any;
  const auditLogs = (taskProperties?.rm_audit_logs || []) as AuditLog[];

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);
  const currentLogs = [...auditLogs]
    .sort((a, b) => b.date - a.date)
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const { isLoading, isError, membersById } = useTeamMembersMap(slug);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError?.message} />;
  }
  
  return (
    <div>
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
              {currentLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell><MemberName membersById={membersById} userId={log.actor?.id} fallback='—'/></TableCell>
                  <TableCell>{log.event}</TableCell>
                  <TableCell>
                    {new Date(log.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {auditLogHelper(log.diff?.field, log.diff?.prevValue, t, membersById)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {auditLogHelper(log.diff?.field, log.diff?.nextValue, t, membersById)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('no-logs-available')}
        </p>
      )}
    </div>
  );
};

export default AuditLogs;
