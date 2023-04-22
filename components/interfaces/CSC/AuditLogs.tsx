import React from 'react'
import type { Task } from '@prisma/client';
import type { AuditLog } from 'types';


const AuditLogs = ({
    task
} : {
    task: Task
}) => {
    const taskProperties = task?.properties as any
    const auditLogs = taskProperties.csc_audit_logs as AuditLog[] | undefined
    return (
        <div style={{ backgroundColor: 'white', padding: '10px 20px' }}>
            <p>audit logs</p>
            {auditLogs && auditLogs.map((log) => {
                return (
                    <div style={{margin: '15px'}}>
                        <p>User: {log.actor.name}</p>
                        <p>Action: {log.event}</p>
                        <p>Date: {new Date(log.date).toLocaleDateString()}</p>
                        <p>Previous value: {log.diff.prevValue}</p>
                        <p>Next value: {log.diff.nextValue}</p>
                    </div>
                )
            })}
        </div>
    )
}

export default AuditLogs