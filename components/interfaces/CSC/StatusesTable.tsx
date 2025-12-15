import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import StatusHeader from './StatusHeader';
import TaskSelector from './TaskSelector';
import { getCscControlsProp } from '@/lib/csc';
import StatusSelector from './StatusSelector';
import type { Task } from '@prisma/client';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import { ISO } from 'types';
import TasksList from './TasksList';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { CscStatus } from '@/lib/csc/csc-statuses';
import frameworks from '@/lib/csc/frameworks';

const StatusesTable = ({
  ISO,
  tasks,
  statuses,
  sectionFilter,
  statusFilter,
  perPage,
  statusHandler,
  taskSelectorHandler,
}: {
  ISO: ISO;
  tasks: Array<Task>;
  statuses: any;
  sectionFilter: string[] | null;
  statusFilter: null | Array<CscStatus>;
  perPage: number;
  statusHandler: (
    control: string,
    value: string
  ) => Promise<string | undefined>;
  taskSelectorHandler: (
    action: string,
    dataToChange: {
      value: number;
    }[],
    control: string
  ) => Promise<string | undefined>;
}) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const cscControlsProp = getCscControlsProp(ISO);

  const filteredControls = useMemo(() => {
    let controls = frameworks[ISO].controls
    const noSection = !sectionFilter?.length;
    const noStatus = !statusFilter?.length;

    if (noSection && noStatus) return controls;

    if (sectionFilter?.length) {
      controls = controls.filter(control => sectionFilter.includes(control.sectionId));
    }

    if (statusFilter?.length) {
      controls = controls.filter(control => statusFilter.includes(statuses[control.id]))
    }

    return controls
  }, [frameworks, sectionFilter, statusFilter])

  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(filteredControls, perPage);

  return (
    <div className="[&_th]:whitespace-normal! [&_td]:whitespace-normal!">
      <div className="overflow-x-auto mt-2">
        <table className="w-full min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                {t('code')}
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                {t('section')}
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                {t('control')}
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                {t('requirements')}
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                <StatusHeader />
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                {t('tasks')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((control) => (
              <tr key={control.id}>
                <td className="px-6 py-3">{t(`csc/${ISO}:controls.${control.id}.code`)}</td>
                <td className="px-6 py-3">{t(`csc/${ISO}:sections.${control.sectionId}.label`)}</td>
                <td className="px-6 py-3">{t(`csc/${ISO}:controls.${control.id}.control`)}</td>
                <td className="px-6 py-3">
                  <span className="whitespace-pre-line">
                    {t(`csc/${ISO}:controls.${control.id}.requirements`)}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {canAccess('task', ['update']) ? (
                    <div className="w-40">
                      <StatusSelector
                        statusValue={statuses[control.id]}
                        control={control.id}
                        handler={statusHandler}
                        isDisabled={
                          !tasks.filter((task: any) =>
                            task.properties?.[cscControlsProp]?.find(
                              (item: string) => item === control.id
                            )
                          ).length
                        }
                      />
                    </div>
                  ) : (
                    <span className="whitespace-pre-line">
                      {statuses[control.id]}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 max-w-80">
                  {canAccess('task', ['update']) ? (
                    <TaskSelector
                      tasks={tasks}
                      control={control.id}
                      handler={taskSelectorHandler}
                      ISO={ISO}
                    />
                  ) : (
                    <TasksList tasks={tasks} control={control.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageData.length > 0 && (
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          onChange={goToPage}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
        />
      )}
    </div>
  );
};

export default StatusesTable;

