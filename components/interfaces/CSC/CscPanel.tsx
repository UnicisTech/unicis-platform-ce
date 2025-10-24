import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { SectionFilter, StatusCscFilter, StatusesTable } from './';
import { PerPageSelector } from '@/components/shared/atlaskit';
import {
  statusOptions,
  perPageOptions,
} from '@/components/defaultLanding/data/configs/csc';
import { ISO } from 'types';
import useCscStatuses from 'hooks/useCscStatuses';
import { Task } from '@prisma/client';
import CscChartsLayout from './CscChartsLayout';

export async function updateCscStatus(params: {
  slug: string;
  control: string;
  value: string;
  framework: ISO;
}) {
  const res = await fetch(`/api/teams/${params.slug}/csc`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      control: params.control,
      value: params.value,
      framework: params.framework,
    }),
  });
  const json = await res.json();
  return {
    data: json.data,
    error: json.error || (!res.ok ? { message: 'Request failed' } : null),
  };
}

export async function updateTaskCsc(params: {
  slug: string;
  taskNumber: string | number;
  controls: string[];
  operation: 'add' | 'remove';
  iso: string;
}) {
  const res = await fetch(
    `/api/teams/${params.slug}/tasks/${params.taskNumber}/csc`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        controls: params.controls,
        operation: params.operation,
        ISO: params.iso,
      }),
    }
  );
  const json = await res.json();
  return {
    data: json.data,
    error: json.error || (!res.ok ? { message: 'Request failed' } : null),
  };
}

interface CscPanelProps {
  slug: string;
  iso: ISO;
  tasks: Task[];
  mutateTasks: () => Promise<any>;
}

export default function CscPanel({
  slug,
  iso,
  tasks,
  mutateTasks,
}: CscPanelProps) {
  const { statuses, mutateStatuses } = useCscStatuses(slug, iso);
  const [sectionFilter, setSectionFilter] = useState<
    null | { label: string; value: string }[]
  >(null);
  const [statusFilter, setStatusFilter] = useState<any[] | null>(null);
  const [perPage, setPerPage] = useState<number>(10);

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      const { error } = await updateCscStatus({
        slug,
        control,
        value,
        framework: iso,
      });
      if (error) return toast.error(error.message || 'Request failed');
      mutateStatuses();
    },
    [slug, iso]
  );

  const taskSelectorHandler = useCallback(
    async (
      action: string,
      dataToChange: Array<{ value: number }>,
      control: string
    ) => {
      const operation = action === 'select-option' ? 'add' : 'remove';

      for (const { value: taskNumber } of dataToChange) {
        const { error } = await updateTaskCsc({
          slug,
          taskNumber,
          controls: [control],
          operation,
          iso,
        });
        if (error) return toast.error(error.message || 'Request failed');
        await mutateTasks();
      }
    },
    [slug, iso, mutateTasks]
  );

  return (
    <>
      <CscChartsLayout statuses={statuses} iso={iso} />

      <div className="flex flex-row justify-end">
        <SectionFilter ISO={iso} setSectionFilter={setSectionFilter} />
        <StatusCscFilter
          setStatusFilter={setStatusFilter}
          options={statusOptions}
        />
        <PerPageSelector
          setPerPage={setPerPage}
          options={perPageOptions}
          placeholder="Controls per page"
          defaultValue={{ label: '10', value: 10 }}
        />
      </div>

      <StatusesTable
        ISO={iso}
        tasks={tasks}
        statuses={statuses}
        sectionFilter={sectionFilter}
        statusFilter={statusFilter}
        perPage={perPage}
        statusHandler={statusHandler}
        taskSelectorHandler={taskSelectorHandler}
      />
    </>
  );
}
