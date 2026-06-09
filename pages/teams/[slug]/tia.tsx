import type { NextPageWithLayout } from 'types';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import { Loading, Error, EmptyState } from '@/components/shared';
import { ModuleEmptyState } from '@/components/shared/ModuleEmptyState';
import type { InferGetServerSidePropsType } from 'next';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import useTeamTasks from 'hooks/useTeamTasks';
import useCanAccess from 'hooks/useCanAccess';
import type { TaskWithTiaProcedure, TaskProperties } from 'types';
import {
  TiaTable,
  DeleteProcedure,
  CreateProcedure,
} from '@/components/interfaces/tia';
import { PerPageSelector } from '@/components/shared';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import { TeamAssessmentAnalysis } from '@/components/interfaces/TeamDashboard';
import { getTeamAccess } from '@/lib/teams';
import {
  exportTiaXlsx,
  exportTiaCsv,
  exportTiaHtml,
  exportTiaPdf,
  exportTiaOds,
} from '@/lib/tia/export';
import ModuleImportModal from '@/components/shared/ModuleImportModal';
import type { TiaImportRow } from '@/lib/tia/import';
import {
  parseTiaImportFile,
  downloadTiaTemplateXlsx,
  downloadTiaTemplateCsv,
  downloadTiaTemplateOds,
} from '@/lib/tia/import';

// TODO: move to components/interfaces/tia
const TiaDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug } = router.query as { slug: string };
  const { canAccess } = useCanAccess(slug);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [importVisible, setImportVisible] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithTiaProcedure | null>(
    null
  );
  const [taskToDelete, setTaskToDelete] = useState<TaskWithTiaProcedure | null>(
    null
  );
  const [perPage, setPerPage] = useState<number>(10);

  const { isLoading, isError, team } = useTeam(slug as string);

  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const tasksWithProcedures = useMemo<Array<TaskWithTiaProcedure>>(() => {
    if (!tasks) {
      return [];
    }
    return tasks.filter((task) => {
      const taskProperties = task.properties as TaskProperties;
      const procedure = taskProperties.tia_procedure;
      return procedure;
    }) as TaskWithTiaProcedure[];
  }, [tasks]);

  const handleExport = async (
    format: 'xlsx' | 'csv' | 'html' | 'pdf' | 'ods'
  ) => {
    if (!tasksWithProcedures || tasksWithProcedures.length === 0) return;
    const teamName = team?.name || 'Team';
    try {
      if (format === 'xlsx')
        await exportTiaXlsx(tasksWithProcedures, teamName, t);
      else if (format === 'csv') exportTiaCsv(tasksWithProcedures, teamName, t);
      else if (format === 'html')
        exportTiaHtml(tasksWithProcedures, teamName, t);
      else if (format === 'pdf') exportTiaPdf(tasksWithProcedures, teamName, t);
      else if (format === 'ods') exportTiaOds(tasksWithProcedures, teamName, t);
    } catch {
      toast.error(t('errors.requestFailed'));
    }
  };

  const importConfig = useMemo(
    () => ({
      moduleKey: 'tia',
      previewHeaders: [
        t('title'),
        t('tia-data-exporter'),
        t('tia-data-importer'),
        t('tia-assessment-date'),
      ],
      previewCells: (row: TiaImportRow) => [
        row.title,
        row.dataExporter,
        row.dataImporter,
        row.assessmentDate,
      ],
      parseFile: parseTiaImportFile,
      downloadXlsx: () => downloadTiaTemplateXlsx(t),
      downloadCsv: () => downloadTiaTemplateCsv(t),
      downloadOds: () => downloadTiaTemplateOds(t),
      buildPayload: (rows: TiaImportRow[]) => ({
        rows: rows.map((r) => ({
          title: r.title,
          dataExporter: r.dataExporter,
          countryExporter: r.countryExporter,
          dataImporter: r.dataImporter,
          countryImporter: r.countryImporter,
          assessmentDate: r.assessmentDate,
          assessmentYears: r.assessmentYears,
        })),
      }),
      apiEndpoint: `/api/teams/${slug}/tia/import`,
    }),
    [slug, t]
  );

  const onEditClickHandler = useCallback((task: TaskWithTiaProcedure) => {
    setTaskToEdit(task);
    setIsEditOpen(true);
  }, []);

  const onDeleteClickHandler = useCallback((task: TaskWithTiaProcedure) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  }, []);

  if (isLoading || !team || !tasks) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  if (!isLoading && !canAccess('tia', ['read'])) {
    return <Error message={t('errors.forbiddenResource')} />;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{t('tia')}</h1>
            {tasksWithProcedures.length > 0 && (
              <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{tasksWithProcedures.length}</span>
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
                  {t('export-tia')}
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
              {t('import-tia')}
            </Button>
          )}
          {canAccess('task', ['update']) && (
            <Button
              variant="default"
              onClick={() => {
                setIsCreateOpen(true);
              }}
            >
              {t('create')}
            </Button>
          )}
          </div>{/* end toolbar */}
      </div>
      <>
        {isCreateOpen && (
          <CreateProcedure
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            tasks={tasks}
            mutateTasks={mutateTasks}
          />
        )}
      </>
      {tasksWithProcedures.length === 0 ? (
        <ModuleEmptyState
          icon="/unicis-tia-logo.png"
          title={t('empty-state.tia.title')}
          description={t('empty-state.tia.description')}
          regulatoryContext={t('empty-state.tia.context')}
          ctaLabel={canAccess('task', ['update']) ? t('empty-state.tia.cta') : undefined}
          onCta={canAccess('task', ['update']) ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <>
          <TeamAssessmentAnalysis slug={slug as string} />
          <TiaTable
            slug={slug as string}
            tasks={tasksWithProcedures}
            perPage={perPage}
            editHandler={onEditClickHandler}
            deleteHandler={onDeleteClickHandler}
          />
          {taskToEdit && isEditOpen && (
            <CreateProcedure
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              prevProcedure={taskToEdit.properties.tia_procedure}
              tasks={tasks}
              selectedTask={taskToEdit}
              mutateTasks={mutateTasks}
            />
          )}
          {taskToDelete && isDeleteOpen && (
            <DeleteProcedure
              visible={isDeleteOpen}
              setVisible={setIsDeleteOpen}
              task={taskToDelete as TaskWithTiaProcedure}
              mutate={mutateTasks}
            />
          )}
        </>
      )}
      <ModuleImportModal<TiaImportRow>
        visible={importVisible}
        setVisible={setImportVisible}
        config={importConfig}
        onSuccess={mutateTasks}
      />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, req, res, query }: GetServerSidePropsContext = context;

  const access = await getTeamAccess(req, res, query);

  if (!access) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ['common', 'tia'])
        : {}),
    },
  };
};

export default TiaDashboard;
