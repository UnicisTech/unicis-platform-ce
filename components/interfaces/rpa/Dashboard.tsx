import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { ModuleEmptyState } from '@/components/shared/ModuleEmptyState';
import useTeamTasks from 'hooks/useTeamTasks';
import useCanAccess from 'hooks/useCanAccess';
import useTeam from 'hooks/useTeam';
import type { TaskWithRpaProcedure, TaskProperties } from 'types';
import {
  RpaTable,
  DeleteProcedure,
  CreateProcedureTest,
} from '@/components/interfaces/rpa';
import { PerPageSelector } from '@/components/shared';
import useRpaCreation from 'hooks/useRpaCreation';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import ProcessingActivitiesAnalysis from '@/components/interfaces/TeamDashboard/TeamProcessingActivities';
import {
  exportRpaXlsx,
  exportRpaCsv,
  exportRpaHtml,
  exportRpaPdf,
  exportRpaOds,
} from '@/lib/rpa/export';
import ModuleImportModal from '@/components/shared/ModuleImportModal';
import type { RpaImportRow } from '@/lib/rpa/import';
import {
  parseRpaImportFile,
  downloadRpaTemplateXlsx,
  downloadRpaTemplateCsv,
  downloadRpaTemplateOds,
} from '@/lib/rpa/import';

const Dashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { canAccess } = useCanAccess(slug as string);
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const { team } = useTeam(slug as string);

  const [perPage, setPerPage] = useState<number>(10);
  const [importVisible, setImportVisible] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRpaProcedure | null>(
    null
  );
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRpaProcedure | null>(
    null
  );

  const rpaState = useRpaCreation();
  const { setIsRpaOpen } = rpaState;

  const onEditClickHandler = useCallback(
    (task: TaskWithRpaProcedure) => {
      setTaskToEdit(task);
      setIsRpaOpen(true);
    },
    [setIsRpaOpen]
  );

  const onDeleteClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  }, []);

  const tasksWithProcedures = useMemo<Array<TaskWithRpaProcedure>>(() => {
    if (!tasks) {
      return [];
    }

    return tasks.filter((task): task is TaskWithRpaProcedure => {
      const taskProperties = task.properties as TaskProperties;
      return Boolean(taskProperties.rpa_procedure);
    });
  }, [tasks]);

  const handleExport = async (
    format: 'xlsx' | 'csv' | 'html' | 'pdf' | 'ods'
  ) => {
    if (!tasksWithProcedures || tasksWithProcedures.length === 0) return;
    const teamName = team?.name || 'Team';
    try {
      if (format === 'xlsx')
        await exportRpaXlsx(tasksWithProcedures, teamName, t);
      else if (format === 'csv') exportRpaCsv(tasksWithProcedures, teamName, t);
      else if (format === 'html')
        exportRpaHtml(tasksWithProcedures, teamName, t);
      else if (format === 'pdf') exportRpaPdf(tasksWithProcedures, teamName, t);
      else if (format === 'ods') exportRpaOds(tasksWithProcedures, teamName, t);
    } catch {
      toast.error(t('errors.requestFailed'));
    }
  };

  const importConfig = useMemo(
    () => ({
      moduleKey: 'rpa',
      previewHeaders: [
        t('title'),
        t('controller'),
        t('rpa-review'),
        t('rpa-data-tranfer'),
      ],
      previewCells: (row: RpaImportRow) => [
        row.title,
        row.controller,
        row.reviewDate,
        row.dataTransfer,
      ],
      parseFile: parseRpaImportFile,
      downloadXlsx: () => downloadRpaTemplateXlsx(t),
      downloadCsv: () => downloadRpaTemplateCsv(t),
      downloadOds: () => downloadRpaTemplateOds(t),
      buildPayload: (rows: RpaImportRow[]) => ({
        rows: rows.map((r) => ({
          title: r.title,
          controller: r.controller,
          reviewDate: r.reviewDate,
          dataTransfer: r.dataTransfer,
          specialCategories: r.specialCategories,
        })),
      }),
      apiEndpoint: `/api/teams/${slug}/rpa/import`,
    }),
    [slug, t]
  );

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            {t('rpa')}
          </h1>
          {tasksWithProcedures.length > 0 && (
            <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
              {tasksWithProcedures.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tasksWithProcedures.length > 0 && (
            <PerPageSelector perPage={perPage} setPerPage={setPerPage} />
          )}
          {tasksWithProcedures.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {t('export-rpa')}
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  {t('export-excel')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('ods')}>
                  {t('export-ods')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  {t('export-csv')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  {t('export-html')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  {t('export-pdf')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {canAccess('task', ['create']) && (
            <Button variant="outline" onClick={() => setImportVisible(true)}>
              {t('import-rpa')}
            </Button>
          )}
          {canAccess('task', ['update']) && (
            <Button
              variant="default"
              onClick={() => {
                setTaskToEdit(null);
                setIsRpaOpen(true);
              }}
            >
              {t('create')}
            </Button>
          )}
        </div>
        {/* end toolbar */}
      </div>
      <CreateProcedureTest
        tasks={tasks}
        mutateTasks={mutateTasks}
        {...rpaState}
        selectedTask={taskToEdit || rpaState.selectedTask}
      />
      {tasksWithProcedures.length === 0 ? (
        <ModuleEmptyState
          icon="/unicis-rpa-logo.png"
          title={t('empty-state.rpa.title')}
          description={t('empty-state.rpa.description')}
          regulatoryContext={t('empty-state.rpa.context')}
          ctaLabel={
            canAccess('task', ['update']) ? t('empty-state.rpa.cta') : undefined
          }
          onCta={
            canAccess('task', ['update'])
              ? () => {
                  setTaskToEdit(null);
                  setIsRpaOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <>
          <ProcessingActivitiesAnalysis slug={slug as string} />
          <RpaTable
            slug={slug as string}
            tasks={tasksWithProcedures}
            perPage={perPage}
            editHandler={onEditClickHandler}
            deleteHandler={onDeleteClickHandler}
          />
          {taskToDelete && isDeleteOpen && (
            <DeleteProcedure
              visible={isDeleteOpen}
              setVisible={setIsDeleteOpen}
              task={taskToDelete as TaskWithRpaProcedure}
              mutate={mutateTasks}
            />
          )}
        </>
      )}
      <ModuleImportModal<RpaImportRow>
        visible={importVisible}
        setVisible={setImportVisible}
        config={importConfig}
        onSuccess={mutateTasks}
      />
    </>
  );
};

export default Dashboard;
