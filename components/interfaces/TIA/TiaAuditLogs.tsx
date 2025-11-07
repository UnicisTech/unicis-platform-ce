import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task } from '@prisma/client';
import type { TaskProperties, TiaAuditLog } from 'types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import Pagination from '@/components/shadcn/ui/audit-pagination';

const ITEMS_PER_PAGE = 20;

const TiaAuditLogs = ({ task }: { task: Task }) => {
  const { t } = useTranslation('common');

  const allLogs = ((task?.properties as TaskProperties)?.tia_audit_logs ||
    []) as TiaAuditLog[];
  const reversedLogs = [...allLogs].reverse();

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(reversedLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = reversedLogs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      {allLogs.length > 0 ? (
        <>
          <Table className="w-full">
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
                    {new Date(log.date).toLocaleDateString('en-GB')}
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

export default TiaAuditLogs;
