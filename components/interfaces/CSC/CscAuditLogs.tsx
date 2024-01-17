import React from 'react';
import type { Task } from '@prisma/client';
import type { CscAuditLog } from 'types';
import { IssuePanelContainer } from 'sharedStyles';

const CscAuditLogs = ({ task }: { task: Task }) => {
  const taskProperties = task?.properties as any;
  const auditLogs = taskProperties.csc_audit_logs as CscAuditLog[] | undefined;
  return (
    <IssuePanelContainer>
      <div style={{ padding: '10px 20px' }}>
        {auditLogs &&
          auditLogs
            .sort((a, b) => b.date - a.date)
            .map((log, index) => {
              return (
                <div key={index} style={{ margin: '15px' }}>
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
