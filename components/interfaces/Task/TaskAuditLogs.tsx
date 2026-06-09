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
  priority: 'priority',
  duedate: 'due-date',
  description: 'description',
};

const eventI18nKeys: Record<string, string> = {
  created: 'task-audit.event-created',
  updated: 'task-audit.event-updated',
  commented: 'task-audit.event-commented',
  deleted: 'task-audit.event-deleted',
};

const valueI18nPrefixes: Record<string, string> = {
  status: 'task-statuses',
  priority: 'task-priorities',
};

const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

  const formatValue = (
    field: string | undefined,
    value: string | string[] | undefined
  ) => {
    if (!value || value === '—') return '—';
    const str = Array.isArray(value) ? value.join(', ') : value;
    if (field === 'description') return stripHtml(str);
    const i18nPrefix = field ? valueI18nPrefixes[field] : undefined;
    if (i18nPrefix) {
      const key = `${i18nPrefix}.${str}`;
      const translated = t(key);
      return translated !== key ? translated : str;
    }
    return str;
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
                  <TableCell>
                    {(() => {
                      const key = eventI18nKeys[log.event];
                      if (!key) return log.event;
                      const translated = t(key);
                      return translated !== key ? translated : log.event;
                    })()}
                  </TableCell>
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
