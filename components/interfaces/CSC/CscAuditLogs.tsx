import React, { useState } from 'react';
import type { Task } from '@prisma/client';
import type { CscAuditLog } from 'types';
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

const CscAuditLogs = ({ task }: { task: Task }) => {
  const taskProperties = task?.properties as any;
  const auditLogs = (taskProperties?.csc_audit_logs || []) as CscAuditLog[];

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);
  const currentLogs = [...auditLogs]
    .sort((a, b) => b.date - a.date)
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      {auditLogs.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Previous Value</TableHead>
                <TableHead>Next Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLogs.map((log, index) => (
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
              totalPages={totalPages}
              onChange={setPage}
              className="mt-4"
            />
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No audit logs available.
        </p>
      )}
    </div>
  );
};

export default CscAuditLogs;
