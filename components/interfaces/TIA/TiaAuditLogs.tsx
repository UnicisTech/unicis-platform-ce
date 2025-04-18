import React from 'react';
import type { Task } from '@prisma/client';
import type { TiaAuditLog } from 'types';
import { IssuePanelContainer } from 'sharedStyles';

const TiaAuditLogs = ({ task }: { task: Task }) => {
  const taskProperties = task?.properties as any;
  const auditLogs = taskProperties.tia_audit_logs as TiaAuditLog[] | undefined;

  return (
    <IssuePanelContainer>
      <div style={{ padding: '10px 20px' }}>
        {auditLogs &&
          auditLogs.reverse().map((log, index) => {
            return (
              <div key={index} style={{ margin: '15px' }}>
                <p>User: {log.actor.name}</p>
                <p>Action: {log.event}</p>
                <p>Date: {new Date(log.date).toLocaleDateString()}</p>
                <p>Previous value: {log.diff?.prevValue?.toString()}</p>
                <p>Next value: {log.diff?.nextValue?.toString()}</p>
              </div>
            );
          })}
      </div>
    </IssuePanelContainer>
  );
};

export default TiaAuditLogs;
