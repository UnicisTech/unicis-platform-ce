import React from 'react';
import type { Task } from '@prisma/client';
import type { RpaAuditLog } from 'types';
import { IssuePanelContainer } from 'sharedStyles';

const RpaAuditLogs = ({ task }: { task: Task }) => {
  const taskProperties = task?.properties as any;
  const auditLogs = taskProperties.rpa_audit_logs as RpaAuditLog[] | undefined;

  return (
    <IssuePanelContainer>
      <div style={{ backgroundColor: 'white', padding: '10px 20px' }}>
        <h2 className="text-1xl font-bold">RPA audit logs</h2>
        {auditLogs &&
          auditLogs.reverse().map((log, index) => {
            return (
              <div key={index} style={{ margin: '15px' }}>
                <p>User: {log.actor.name}</p>
                <p>Action: {log.event}</p>
                <p>Date: {new Date(log.date).toLocaleDateString()}</p>
                <p>Previous value: {log.diff?.prevValue?.toString()}</p>
                <p>Next value: {log.diff?.nextValue.toString()}</p>
              </div>
            );
          })}
      </div>
    </IssuePanelContainer>
  );
};

export default RpaAuditLogs;
