import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import StatusHeader from './StatusHeader';
import TaskSelector from './TaskSelector';
import { getControlOptions } from '@/components/defaultLanding/data/configs/csc';
import { getCscControlsProp } from '@/lib/csc';
import StatusSelector from './StatusSelector';
import type { CscOption } from 'types';
import type { Task } from '@prisma/client';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import { ControlOption, ISO } from 'types';
import TasksList from './TasksList';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';

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
  sectionFilter: null | Array<{ label: string; value: string }>;
  statusFilter: null | Array<CscOption>;
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

  const filteredControls = useMemo<ControlOption[]>(() => {
    let ctrls = getControlOptions(ISO);

    const noSection = !sectionFilter?.length;
    const noStatus = !statusFilter?.length;
    if (noSection && noStatus) return ctrls;

    if (sectionFilter?.length) {
      const sections = sectionFilter.map((o) => o.value);
      ctrls = ctrls.filter((item) => {
        const content = item.value.section;
        return ISO === '2013'
          ? sections.some((sec) => content.includes(sec))
          : sections.includes(content);
      });
    }

    if (statusFilter?.length) {
      const labels = statusFilter.map((o) => o.label);
      ctrls = ctrls.filter((c) => labels.includes(statuses[c.value.control]));
    }

    return ctrls;
  }, [ISO, sectionFilter, statusFilter, statuses]);

  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<ControlOption>(filteredControls, perPage);

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
            {pageData.map((option) => (
              <tr key={option.value.control}>
                <td className="px-6 py-3">{option.value.code}</td>
                <td className="px-6 py-3">{option.value.section}</td>
                <td className="px-6 py-3">
                  {option.value.controlLabel || option.value.control}
                </td>
                <td className="px-6 py-3">
                  <span className="whitespace-pre-line">
                    {option.value.requirements}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {canAccess('task', ['update']) ? (
                    <div className="w-40">
                      <StatusSelector
                        statusValue={statuses[option.value.control]}
                        control={option.value.control}
                        handler={statusHandler}
                        isDisabled={
                          !tasks.filter((task: any) =>
                            task.properties?.[cscControlsProp]?.find(
                              (item: string) => item === option.value.control
                            )
                          ).length
                        }
                      />
                    </div>
                  ) : (
                    <span className="whitespace-pre-line">
                      {statuses[option.value.control]}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 max-w-80">
                  {canAccess('task', ['update']) ? (
                    <TaskSelector
                      tasks={tasks}
                      control={option.value.control}
                      handler={taskSelectorHandler}
                      ISO={ISO}
                    />
                  ) : (
                    <TasksList tasks={tasks} control={option.value.control} />
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
