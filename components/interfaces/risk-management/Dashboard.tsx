import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import useCanAccess from 'hooks/useCanAccess';
import useTeamTasks from 'hooks/useTeamTasks';
import useTeam from 'hooks/useTeam';
import { useRouter } from 'next/router';
import { TaskProperties, TaskWithRmRisk } from 'types';
import { EmptyState, Error } from '@/components/shared';
import { ModuleEmptyState } from '@/components/shared/ModuleEmptyState';
import RisksTable from './RisksTable';
import DeleteRisk from './DeleteRisk';
import CreateRisk from './risk-form/RmRiskDialog';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import RmAnalysis from '../TeamDashboard/RmAnalysis';
import { impactLabelKeys, probabilityLabelKeys } from '@/lib/common';
import {
  exportRmXlsx,
  exportRmCsv,
  exportRmHtml,
  exportRmPdf,
  exportRmOds,
} from '@/lib/rm/export';
import ModuleImportModal from '@/components/shared/ModuleImportModal';
import type { RmImportRow } from '@/lib/rm/import';
import {
  parseRmImportFile,
  downloadRmTemplateXlsx,
  downloadRmTemplateCsv,
  downloadRmTemplateOds,
} from '@/lib/rm/import';

interface RmMatrixFilter {
  x: number;
  y: number;
}

const getQueryNumber = (
  value: string | string[] | undefined
): number | null => {
  const queryValue = Array.isArray(value) ? value[0] : value;
  if (queryValue === undefined) {
    return null;
  }

  const numericValue = Number(queryValue);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const getMatrixFilterFromQuery = (
  ix: string | string[] | undefined,
  iy: string | string[] | undefined
): RmMatrixFilter | null => {
  const x = getQueryNumber(ix);
  const y = getQueryNumber(iy);

  if (x === null || y === null) {
    return null;
  }

  return { x, y };
};

const transformToRange = (value: number): number => {
  return Math.floor(value / 20);
};

const Dashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { canAccess } = useCanAccess(slug as string);
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const { team } = useTeam(slug as string);
  //TODO: setPerPage
  const [perPage] = useState<number>(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRmRisk | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRmRisk | null>(null);

  const queryMatrixFilter = useMemo(
    () => getMatrixFilterFromQuery(router.query.ix, router.query.iy),
    [router.query.ix, router.query.iy]
  );
  const [matrixFilterOverride, setMatrixFilterOverride] = useState<
    RmMatrixFilter | null | undefined
  >();
  const matrixFilter =
    matrixFilterOverride === undefined
      ? queryMatrixFilter
      : matrixFilterOverride;

  const tasksWithRisks = useMemo(() => {
    if (!tasks) {
      return [];
    }
    return tasks.filter((tasks) => {
      const taskProperties = tasks.properties as TaskProperties;
      const procedure = taskProperties.rm_risk;
      return procedure;
    }) as TaskWithRmRisk[];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!matrixFilter) return tasksWithRisks;

    return tasksWithRisks.filter((task) => {
      const risk = task.properties.rm_risk;
      const treatedImpact = risk?.[1]?.TreatedImpact as number;
      const treatedProbability = risk?.[1]?.TreatedProbability as number;
      if (!treatedImpact && treatedImpact !== 0) return false;
      if (!treatedProbability && treatedProbability !== 0) return false;
      return (
        transformToRange(treatedImpact) === matrixFilter.x &&
        transformToRange(treatedProbability) === matrixFilter.y
      );
    });
  }, [tasksWithRisks, matrixFilter]);

  const handleMatrixCellClick = useCallback(
    (x: number, y: number) => {
      setMatrixFilterOverride((prev) => {
        const currentFilter = prev === undefined ? queryMatrixFilter : prev;
        return currentFilter?.x === x && currentFilter?.y === y
          ? null
          : { x, y };
      });
    },
    [queryMatrixFilter]
  );

  const handleExport = async (
    format: 'xlsx' | 'csv' | 'html' | 'pdf' | 'ods'
  ) => {
    if (!tasksWithRisks || tasksWithRisks.length === 0) return;
    const teamName = team?.name || 'Team';
    try {
      if (format === 'xlsx') await exportRmXlsx(tasksWithRisks, teamName, t);
      else if (format === 'csv') exportRmCsv(tasksWithRisks, teamName, t);
      else if (format === 'html') exportRmHtml(tasksWithRisks, teamName, t);
      else if (format === 'pdf') exportRmPdf(tasksWithRisks, teamName, t);
      else if (format === 'ods') exportRmOds(tasksWithRisks, teamName, t);
    } catch {
      toast.error(t('errors.requestFailed'));
    }
  };

  const importConfig = useMemo(
    () => ({
      moduleKey: 'rm',
      previewHeaders: [
        t('title'),
        t('rm:fields.Risk'),
        t('rm:fields.Impact'),
        t('rm:fields.RawProbability'),
      ],
      previewCells: (row: RmImportRow) => [
        row.title,
        row.risk,
        row.impact,
        row.rawProbability,
      ],
      parseFile: parseRmImportFile,
      downloadXlsx: () => downloadRmTemplateXlsx(t),
      downloadCsv: () => downloadRmTemplateCsv(t),
      downloadOds: () => downloadRmTemplateOds(t),
      buildPayload: (rows: RmImportRow[]) => ({
        rows: rows.map((r) => ({
          title: r.title,
          risk: r.risk,
          assetOwner: r.assetOwner,
          impact: r.impact,
          rawProbability: r.rawProbability,
          rawImpact: r.rawImpact,
          riskTreatment: r.riskTreatment,
          treatmentCost: r.treatmentCost,
          treatmentStatus: r.treatmentStatus,
          treatedProbability: r.treatedProbability,
          treatedImpact: r.treatedImpact,
        })),
      }),
      apiEndpoint: `/api/teams/${slug}/rm/import`,
    }),
    [slug, t]
  );

  const onEditClickHandler = useCallback((task: TaskWithRmRisk) => {
    setTaskToEdit(task);
    setIsEditOpen(true);
  }, []);

  const onDeleteClickHandler = useCallback((task: TaskWithRmRisk) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  }, []);

  if (!canAccess('rm', ['read'])) {
    return <Error message={t('errors.forbiddenResource')} />;
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('rm-dashboard')}
          </h2>
        </div>
        <div className="flex justify-end items-center gap-2 my-1 flex-wrap">
          {tasksWithRisks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {t('export-rm')}
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
              {t('import-rm')}
            </Button>
          )}
          {canAccess('task', ['update']) && (
            <Button
              color="primary"
              onClick={() => {
                setIsCreateOpen(true);
              }}
            >
              {t('create')}
            </Button>
          )}
        </div>
      </div>
      {isCreateOpen && (
        <CreateRisk
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          tasks={tasks || []}
          mutateTasks={mutateTasks}
        />
      )}
      {tasksWithRisks.length === 0 ? (
        <ModuleEmptyState
          icon="/unicis-risk-logo.png"
          title={t('empty-state.risk.title')}
          description={t('empty-state.risk.description')}
          regulatoryContext={t('empty-state.risk.context')}
          ctaLabel={canAccess('task', ['update']) ? t('empty-state.risk.cta') : undefined}
          onCta={canAccess('task', ['update']) ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <>
          <div className="mb-2">
            <RmAnalysis
              slug={slug as string}
              onCellClick={handleMatrixCellClick}
            />
          </div>
          {matrixFilter && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {t('filtered-by')}: {t(impactLabelKeys[matrixFilter.x])},{' '}
                {t(probabilityLabelKeys[matrixFilter.y])}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMatrixFilterOverride(null)}
              >
                {t('clear-filter')}
              </Button>
            </div>
          )}
          <RisksTable
            slug={slug as string}
            tasks={filteredTasks}
            perPage={perPage}
            editHandler={onEditClickHandler}
            deleteHandler={onDeleteClickHandler}
          />
          {taskToEdit && isEditOpen && (
            <CreateRisk
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              selectedTask={taskToEdit}
              prevRisk={taskToEdit.properties.rm_risk}
              tasks={tasks || []}
              mutateTasks={mutateTasks}
            />
          )}
          {taskToDelete && isDeleteOpen && (
            <DeleteRisk
              visible={isDeleteOpen}
              setVisible={setIsDeleteOpen}
              task={taskToDelete}
              mutate={mutateTasks}
            />
          )}
        </>
      )}
      <ModuleImportModal<RmImportRow>
        visible={importVisible}
        setVisible={setImportVisible}
        config={importConfig}
        onSuccess={mutateTasks}
      />
    </>
  );
};

export default Dashboard;
