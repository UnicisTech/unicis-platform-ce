import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import StatusHeader from './StatusHeader';
import TaskSelector from './TaskSelector';
import { getCscControlsProp } from '@/lib/csc';
import StatusSelector from './StatusSelector';
import type { Task } from '@/generated/browser';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import { ISO } from 'types';
import TasksList from './TasksList';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { CscStatus } from '@/lib/csc/csc-statuses';
import frameworks from '@/lib/csc/frameworks';
import ControlCodeLink from './ControlCodeLink';
import ControlMappingDrawer from './ControlMappingDrawer';
import { getMappingCount } from '@/lib/csc/framework-mapping-utils';

const StatusesTable = ({
  slug,
  ISO,
  tasks,
  statuses,
  sectionFilter,
  statusFilter,
  perPage,
  statusHandler,
  taskSelectorHandler,
  enabledFrameworks,
  onLinkTask,
}: {
  slug: string;
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
    dataToChange: { value: number }[],
    control: string
  ) => Promise<string | undefined>;
  /** All frameworks currently enabled in Cybersecurity Settings */
  enabledFrameworks: ISO[];
  /** Called when user links a task to a control via the mapping drawer */
  onLinkTask: (
    taskNumber: number,
    controlId: string,
    iso: ISO
  ) => Promise<void>;
}) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(slug);
  const cscControlsProp = getCscControlsProp(ISO);

  // ── Mapping drawer state ───────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerControl, setDrawerControl] = useState<{
    id: string;
    code: string;
    title: string;
  } | null>(null);

  const openDrawer = useCallback((id: string, code: string, title: string) => {
    setDrawerControl({ id, code, title });
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // ── Filtering ──────────────────────────────────────────────
  const filteredControls = useMemo(() => {
    let controls = frameworks[ISO].controls;
    const noSection = !sectionFilter?.length;
    const noStatus = !statusFilter?.length;

    if (noSection && noStatus) return controls;

    if (sectionFilter?.length) {
      controls = controls.filter((control) =>
        sectionFilter.includes(control.sectionId)
      );
    }

    if (statusFilter?.length) {
      controls = controls.filter((control) =>
        statusFilter.includes(statuses[control.id])
      );
    }

    return controls;
  }, [ISO, frameworks, sectionFilter, statusFilter, statuses]);

  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(filteredControls, perPage);

  return (
    <>
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
              {pageData.map((control) => {
                const code = t(`csc/${ISO}:controls.${control.id}.code`);
                const title = t(`csc/${ISO}:controls.${control.id}.control`);
                const mappingCount = getMappingCount(
                  control.id,
                  enabledFrameworks,
                  ISO
                );
                return (
                  <tr key={control.id}>
                    {/* Clickable control code — opens mapping drawer */}
                    <td className="px-6 py-3">
                      <ControlCodeLink
                        code={code}
                        mappingCount={mappingCount}
                        onClick={() => openDrawer(control.id, code, title)}
                      />
                    </td>
                    <td className="px-6 py-3">
                      {t(`csc/${ISO}:sections.${control.sectionId}.label`)}
                    </td>
                    <td className="px-6 py-3">{title}</td>
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
                );
              })}
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

      {/* Mapping drawer — portal-like overlay from right side */}
      {drawerControl && (
        <ControlMappingDrawer
          isOpen={drawerOpen}
          onClose={closeDrawer}
          controlId={drawerControl.id}
          controlCode={drawerControl.code}
          controlTitle={drawerControl.title}
          currentFramework={ISO}
          enabledFrameworks={enabledFrameworks}
          tasks={tasks}
          onLinkTask={onLinkTask}
        />
      )}
    </>
  );
};

export default StatusesTable;
