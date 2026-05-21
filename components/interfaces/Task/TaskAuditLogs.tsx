import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task, AuditLog, TaskProperties } from 'types';
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

const fieldI18nKeys: Record<string, string> = {
  title: 'title',
  status: 'status',
  duedate: 'due-date',
  description: 'description',
};

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
};

const TaskAuditLogs = ({ task }: { task: Task }) => {
  const { t } = useTranslation('common');

  const taskProperties = task?.properties as TaskProperties;
  const auditLogs = (taskProperties?.task_audit_logs || []) as AuditLog[];

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);
  const currentLogs = [...auditLogs]
    .sort((a, b) => b.date - a.date)
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const formatValue = (field: string | undefined, value: string | string[] | undefined) => {
    if (!value || value === '—') return '—';
    const str = Array.isArray(value) ? value.join(', ') : value;
    return field === 'description' ? stripHtml(str) : str;
  };

  return (
    <div>
      {auditLogs.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('field')}</TableHead>
                <TableHead>{t('action')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('prev-value')}</TableHead>
                <TableHead>{t('next-value')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.actor?.name || '—'}</TableCell>
                  <TableCell>
                    {log.diff?.field
                      ? t(fieldI18nKeys[log.diff.field] ?? log.diff.field)
                      : '—'}
                  </TableCell>
                  <TableCell>{log.event}</TableCell>
                  <TableCell>
                    {new Date(log.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {formatValue(log.diff?.field, log.diff?.prevValue)}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {formatValue(log.diff?.field, log.diff?.nextValue)}
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
              className="mt-4"
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

export default TaskAuditLogs;
