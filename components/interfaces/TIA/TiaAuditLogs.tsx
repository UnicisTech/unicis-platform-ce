import React from 'react';
import type { Task } from '@prisma/client';
import type { TiaAuditLog } from 'types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';

const TiaAuditLogs = ({ task }: { task: Task }) => {
  const taskProperties = task?.properties as any;
  const auditLogs = (taskProperties.tia_audit_logs || []) as TiaAuditLog[];

  return (
    <div>
      <div className="p-6">
        {auditLogs.length > 0 ? (
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
              {[...auditLogs].reverse().map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.actor?.name || '—'}</TableCell>
                  <TableCell>{log.event}</TableCell>
                  <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
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
        ) : (
          <p className="text-sm text-muted-foreground">No audit logs available.</p>
        )}
      </div>
    </div>
  );
};

export default TiaAuditLogs;
