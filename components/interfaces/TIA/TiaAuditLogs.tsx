import React, { useState } from 'react';
import type { Task } from '@prisma/client';
import type { TiaAuditLog } from 'types';
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
const mockTiaAuditLogs = [
  {
    date: 1748736000000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: 'c07a60a4-1287-42bf-aa5e-2788324132af',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'updated',
  },
  {
    date: 1748822400000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '027656e4-e7ac-4542-be7f-b33c58699beb',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'created',
  },
  {
    date: 1748908800000,
    diff: { prevValue: 'enabled', nextValue: 'disabled' },
    actor: {
      id: 'b3d95d0f-67d4-441e-a6d6-558d2a5443bc',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'updated',
  },
  {
    date: 1748995200000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '5106e191-a2ac-4826-96a0-aced61f4b206',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'deleted',
  },
  {
    date: 1749081600000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '11587385-fe79-4ffc-8422-ee2380a9a0a1',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
    event: 'updated',
  },
  {
    date: 1749168000000,
    diff: null,
    actor: {
      id: '024a0e2f-645b-4c2f-8813-32f99779c7f6',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'deleted',
  },
  {
    date: 1749254400000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: 'a0f6dd69-a4b1-4f79-9f81-ce3371adb33d',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'deleted',
  },
  {
    date: 1749340800000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: 'b35bca77-d8b3-495b-a110-b049e5260b95',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
    event: 'deleted',
  },
  {
    date: 1749427200000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: 'cf5f5dc1-8931-4f02-81b8-e8b3afb0e864',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'created',
  },
  {
    date: 1749513600000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: 'aca17777-f90f-4902-929b-cf2e6707ffb7',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'created',
  },
  {
    date: 1749600000000,
    diff: { prevValue: 'enabled', nextValue: 'disabled' },
    actor: {
      id: '16377b87-457e-464a-ae2c-aca8cc3174fc',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'created',
  },
  {
    date: 1749686400000,
    diff: null,
    actor: {
      id: 'd935a468-6ba5-4fdc-a9b1-ff1cb99ffac2',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
    event: 'created',
  },
  {
    date: 1749772800000,
    diff: null,
    actor: {
      id: 'b8d29c1b-d2a9-439e-9ff5-a6991f5ac402',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'updated',
  },
  {
    date: 1749859200000,
    diff: { prevValue: 'enabled', nextValue: 'disabled' },
    actor: {
      id: '4c746c94-2641-477a-9519-7974737c1893',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
    event: 'created',
  },
  {
    date: 1749945600000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: '7b851ee4-a9cc-43af-a0fd-c33671c23a48',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'updated',
  },
  {
    date: 1750032000000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: 'c4c28a52-4d1c-4c43-8e76-873ca49c6ced',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'updated',
  },
  {
    date: 1750118400000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '44dfdbc5-3d75-4530-9546-34e7686db0aa',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
    event: 'deleted',
  },
  {
    date: 1750204800000,
    diff: { prevValue: 'enabled', nextValue: 'disabled' },
    actor: {
      id: '5eab02d0-a737-4900-b728-a0d43e8509b1',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'created',
  },
  {
    date: 1750291200000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '07848a0b-93b5-4059-b6f2-23a74fd1f211',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
    event: 'created',
  },
  {
    date: 1750377600000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '839e2fd0-dfb6-43e7-9618-1c2c4c9e2725',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'deleted',
  },
  {
    date: 1750464000000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: '090ebe9e-b543-486f-ac1a-c38ab39ae301',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
    event: 'updated',
  },
  {
    date: 1750550400000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '7fd2b115-8987-4877-947a-819a89f6f2d8',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'updated',
  },
  {
    date: 1750636800000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: '89ae7283-463a-441c-89c2-71cea602dc75',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    event: 'created',
  },
  {
    date: 1750723200000,
    diff: { prevValue: 'A', nextValue: 'B' },
    actor: {
      id: '55afa48b-8fdb-40bb-a0d6-a7d63d941f7e',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
    },
    event: 'created',
  },
  {
    date: 1750809600000,
    diff: { prevValue: 'low', nextValue: 'medium' },
    actor: {
      id: '853a4873-7387-4a36-a6c3-3b0218a8dfac',
      name: 'Vitalii Nezdvetskyi',
      email: 'vnezdd@gmail.com',
    },
    event: 'updated',
  },
];

const TiaAuditLogs = ({ task }: { task: Task }) => {
  const taskProperties = task?.properties as any;
  const allLogs = (mockTiaAuditLogs || []) as TiaAuditLog[];
  const reversedLogs = [...allLogs].reverse();

  // console.log("taskProperties.tia_audit_logs", taskProperties.tia_audit_logs)

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
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Previous Value</TableHead>
                <TableHead>Next Value</TableHead>
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
          No audit logs available.
        </p>
      )}
    </div>
  );
};

export default TiaAuditLogs;
