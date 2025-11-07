import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task } from '@prisma/client';
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

const LOGS_PER_PAGE = 20;

const RpaAuditLogs = ({ task }: { task: Task }) => {
  const { t } = useTranslation('common');

  const taskProperties = task?.properties as any;
  const auditLogs = (taskProperties.rpa_audit_logs || []) as RpaAuditLog[];

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(auditLogs.length / LOGS_PER_PAGE);
  const start = (page - 1) * LOGS_PER_PAGE;
  const paginatedLogs = [...auditLogs]
    .reverse()
    .slice(start, start + LOGS_PER_PAGE);

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
                  <TableCell>{log.actor?.name || '—'}</TableCell>
                  <TableCell>{log.event}</TableCell>
                  <TableCell>
                    {new Date(log.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.diff?.prevValue?.toString() || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.diff?.nextValue?.toString() || '—'}
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
        <p className="text-sm text-muted-foreground">
          {t('no-logs-available')}
        </p>
      )}
    </div>
  );
};

export default RpaAuditLogs;
