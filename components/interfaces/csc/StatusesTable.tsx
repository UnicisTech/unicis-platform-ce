import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import StatusHeader from './StatusHeader';
import TaskSelector from './TaskSelector';
import { getCscControlsProp } from '@/lib/csc';
import StatusSelector from './StatusSelector';
import type { Task } from 'types';
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
import { BulkActionBar } from '@/components/shared';

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
  onBulkLinkMapped,
  onBulkStatusChange,
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
  /** Bulk-link tasks to mapped controls across frameworks, propagating source status */
  onBulkLinkMapped: (
    taskNumbers: number[],
    mappedControls: Array<{ controlId: string; framework: ISO }>,
    sourceControlId?: string
  ) => Promise<void>;
  /** Bulk-update status for all selected controls in a single coordinated operation */
  onBulkStatusChange: (
    newStatus: string,
    controlIds: string[]
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
  const [bulkTaskLinkOpen, setBulkTaskLinkOpen] = useState(false);
  const [selectedTaskNumbers, setSelectedTaskNumbers] = useState<Set<number>>(
    new Set()
  );

  const openDrawer = useCallback((id: string, code: string, title: string) => {
    setDrawerControl({ id, code, title });
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // ── Bulk selection state ────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionStep, setBulkActionStep] = useState<
    'link-tasks' | 'change-status'
  >('link-tasks');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const openBulkTaskLink = useCallback(() => {
    setBulkActionStep('link-tasks');
    setBulkTaskLinkOpen(true);
  }, []);

  const closeBulkTaskLink = useCallback(() => {
    setBulkTaskLinkOpen(false);
    setSelectedTaskNumbers(new Set());
  }, []);

  const completeBulkTaskLinking = useCallback(() => {
    setBulkTaskLinkOpen(false);
    setBulkActionStep('change-status');
    setSelectedTaskNumbers(new Set());
  }, []);

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

  // ── Bulk selection callbacks (defined after pageData is available) ──
  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next =
        prev.size === pageData.length
          ? new Set<string>()
          : new Set<string>(pageData.map((c) => c.id));
      return next;
    });
  }, [pageData]);

  // Check which selected controls are missing tasks
  const { allSelectedHaveTasks, missingTasksSet } = useMemo(() => {
    if (selectedIds.size === 0)
      return { allSelectedHaveTasks: true, missingTasksSet: new Set<string>() };

    const missing = new Set<string>();

    Array.from(selectedIds).forEach((controlId) => {
      const controlTasks = tasks.filter((task: any) =>
        task.properties?.[cscControlsProp]?.includes(controlId)
      );
      if (controlTasks.length === 0) {
        missing.add(controlId);
      }
    });

    return {
      allSelectedHaveTasks: missing.size === 0,
      missingTasksSet: missing,
    };
  }, [selectedIds, tasks, cscControlsProp]);

  const activeBulkActionStep =
    allSelectedHaveTasks && selectedIds.size > 0
      ? 'change-status'
      : bulkActionStep;

  const handleBulkStatusChange = useCallback(
    async (newStatus: string) => {
      try {
        const controlsToUpdate = Array.from(selectedIds);
        if (controlsToUpdate.length === 0) return;

        await onBulkStatusChange(newStatus, controlsToUpdate);

        toast.success(
          t('csc.bulk-status-updated', {
            defaultValue: `${selectedIds.size} controls updated to "{{status}}"`,
            count: selectedIds.size,
            status: newStatus,
          })
        );
        setSelectedIds(new Set());
        setBulkActionStep('link-tasks');
        setStatusDropdownOpen(false);
      } catch {
        toast.error(t('errors.requestFailed'));
      }
    },
    [selectedIds, onBulkStatusChange, t]
  );

  // Handle bulk task linking for selected controls
  const handleBulkLinkTasks = useCallback(
    async (taskNumbers: number[]) => {
      try {
        const controlsToUpdate = Array.from(selectedIds);

        for (const taskNumber of taskNumbers) {
          for (const controlId of controlsToUpdate) {
            await taskSelectorHandler(
              'select-option',
              [{ value: taskNumber }],
              controlId
            );
          }
        }

        toast.success(
          t('csc.bulk-tasks-linked', {
            defaultValue: 'Tasks linked to {{count}} controls',
            count: selectedIds.size,
          })
        );
        completeBulkTaskLinking();
      } catch {
        toast.error(t('errors.requestFailed'));
      }
    },
    [selectedIds, taskSelectorHandler, t, completeBulkTaskLinking]
  );

  return (
    <>
      <div className="flex-1 min-w-0 [&_th]:whitespace-normal! [&_td]:whitespace-normal!">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide w-12"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === pageData.length &&
                      pageData.length > 0
                    }
                    onChange={toggleAll}
                    aria-label="Select all controls on this page"
                    className="w-4 h-4"
                  />
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  {t('code')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  {t('section')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  {t('control')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  {t('requirements')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  <StatusHeader />
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  {t('tasks')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
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
                    {/* Selection checkbox */}
                    <td className="px-3 py-2 w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(control.id)}
                        onChange={() => toggleSelect(control.id)}
                        aria-label={`Select ${code}`}
                        className="w-4 h-4"
                      />
                    </td>
                    {/* Clickable control code — opens mapping drawer */}
                    <td className="px-3 py-2">
                      <ControlCodeLink
                        code={code}
                        mappingCount={mappingCount}
                        onClick={() => openDrawer(control.id, code, title)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {t(`csc/${ISO}:sections.${control.sectionId}.label`)}
                    </td>
                    <td className="px-3 py-2">{title}</td>
                    <td className="px-3 py-2">
                      <span className="whitespace-pre-line">
                        {t(`csc/${ISO}:controls.${control.id}.requirements`)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {canAccess('task', ['update']) ? (
                        <div className="w-40">
                          <StatusSelector
                            key={`${control.id}:${statuses[control.id]}`}
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
                    <td className="px-3 py-2 max-w-80">
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

      {/* Bulk action bar — shown when rows are selected */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          step={activeBulkActionStep}
          onLinkTasks={openBulkTaskLink}
          onStatusChange={handleBulkStatusChange}
          onClear={() => {
            setSelectedIds(new Set());
            setBulkActionStep('link-tasks');
            setStatusDropdownOpen(false);
          }}
          statusDropdownOpen={statusDropdownOpen}
          onToggleStatusDropdown={() =>
            setStatusDropdownOpen(!statusDropdownOpen)
          }
          hasAllTasksAssigned={allSelectedHaveTasks}
          showTaskLinkingStep={missingTasksSet.size > 0}
        />
      )}

      {/* Bulk task linking dialog */}
      {bulkTaskLinkOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium mb-2">
              {t('bulk-actions.link-tasks-required')} - {selectedIds.size}{' '}
              {selectedIds.size === 1 ? 'control' : 'controls'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {t('bulk-actions.select-tasks-description')}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 border border-slate-200 dark:border-slate-700 rounded p-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  {t('no-tasks-available', {
                    defaultValue: 'No tasks available',
                  })}
                </p>
              ) : (
                tasks.map((task) => (
                  <label
                    key={task.taskNumber}
                    className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTaskNumbers.has(task.taskNumber)}
                      onChange={(e) => {
                        setSelectedTaskNumbers((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) {
                            next.add(task.taskNumber);
                          } else {
                            next.delete(task.taskNumber);
                          }
                          return next;
                        });
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex-1">
                      {task.taskNumber} - {task.title}
                    </span>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={closeBulkTaskLink}
                className="flex-1 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (selectedTaskNumbers.size > 0) {
                    handleBulkLinkTasks(Array.from(selectedTaskNumbers));
                  }
                }}
                disabled={selectedTaskNumbers.size === 0}
                className="flex-1 px-3 py-2 rounded bg-ub-blue text-white text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {selectedTaskNumbers.size > 0
                  ? `${t('bulk-actions.link-selected-tasks')} (${selectedTaskNumbers.size})`
                  : t('bulk-actions.link-selected-tasks')}
              </button>
            </div>
          </div>
        </div>
      )}

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
          onBulkLinkMapped={onBulkLinkMapped}
        />
      )}
    </>
  );
};

export default StatusesTable;
