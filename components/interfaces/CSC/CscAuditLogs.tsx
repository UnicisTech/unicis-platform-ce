import React from 'react';
import type { Task } from '@prisma/client';
import type { CscAuditLog } from 'types';
import { IssuePanelContainer } from 'sharedStyles';

const CscAuditLogs = ({ task }: { task: Task }) => {
  const taskProperties = task?.properties as any;
  const auditLogs = taskProperties.csc_audit_logs as CscAuditLog[] | undefined;
  return (
    <IssuePanelContainer>
      <div style={{ backgroundColor: 'white', padding: '10px 20px' }}>
        <h2 className="text-1xl font-bold">CSC audit logs</h2>
        {auditLogs &&
          auditLogs
            .sort((a, b) => b.date - a.date)
            .map((log) => {
              return (
                <div style={{ margin: '15px' }}>
                  <p>User: {log.actor.name}</p>
                  <p>Action: {log.event}</p>
                  <p>Date: {new Date(log.date).toLocaleDateString()}</p>
                  <p>Previous value: {log.diff.prevValue}</p>
                  <p>Next value: {log.diff.nextValue}</p>
                </div>
              );
            })}
      </div>
    </IssuePanelContainer>
  );
};

export default CscAuditLogs;
