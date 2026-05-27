import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';
import useTeamTasks from 'hooks/useTeamTasks';
import { EmptyState, Error, PerPageSelector } from '@/components/shared';
import { TaskProperties, TaskWithPiaRisk } from 'types';
import RisksTable from './RisksTable';
import DeleteRisk from './DeleteRisk';
import CreateRisk from './risk-form/RiskAssessmentDialog';
import { Button } from '@/components/shadcn/ui/button';
import { PiaAnalysis } from '../TeamDashboard';
import { riskSecurityPoints, riskProbabilityPoints } from '@/lib/pia';
import { piaDashboardConfig } from '../TeamDashboard/PiaAnalysis';
import { impactLabelKeys, probabilityLabelKeys } from '@/lib/common';

interface PiaMatrixFilter {
  category: number;
  x: number;
  y: number;
}

const Dashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { canAccess, isLoading } = useCanAccess(slug as string);
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  //TODO: setPerPage
  const [perPage, setPerPage] = useState<number>(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithPiaRisk | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithPiaRisk | null>(
    null
  );

  const [matrixFilter, setMatrixFilter] = useState<PiaMatrixFilter | null>(
    null
  );

  useEffect(() => {
    const { category, ix, iy } = router.query;
    if (category && ix && iy) {
      setMatrixFilter({
        category: Number(category),
        x: Number(ix),
        y: Number(iy),
      });
    }
  }, [router.query]);

  const tasksWithRisks = useMemo(() => {
    if (!tasks) {
      return [];
    }
    return tasks.filter((tasks) => {
      const taskProperties = tasks.properties as TaskProperties;
      const procedure = taskProperties.pia_risk;
      return procedure;
    }) as TaskWithPiaRisk[];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!matrixFilter) return tasksWithRisks;

    const config = piaDashboardConfig.find(
      (c) => c.id === matrixFilter.category
    );
    if (!config) return tasksWithRisks;

    return tasksWithRisks.filter((task) => {
      const risk = task.properties.pia_risk;
      const securityValue = risk?.[matrixFilter.category]?.[config.security];
      const probabilityValue =
        risk?.[matrixFilter.category]?.[config.probability];
      if (!securityValue || !probabilityValue) return false;
      return (
        riskSecurityPoints[securityValue] === matrixFilter.x &&
        riskProbabilityPoints[probabilityValue] === matrixFilter.y
      );
    });
  }, [tasksWithRisks, matrixFilter]);

  const handleMatrixCellClick = useCallback(
    (category: number, x: number, y: number) => {
      setMatrixFilter((prev) =>
        prev?.category === category && prev?.x === x && prev?.y === y
          ? null
          : { category, x, y }
      );
    },
    []
  );

  const onEditClickHandler = useCallback((task: TaskWithPiaRisk) => {
    setTaskToEdit(task);
    setIsEditOpen(true);
  }, []);

  const onDeleteClickHandler = useCallback((task: TaskWithPiaRisk) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isLoading && !canAccess('pia', ['read'])) {
    return <Error message={t('errors.forbiddenResource')} />;
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('pia-dashboard')}
          </h2>
        </div>
        <div className="flex justify-end items-center my-1">
          {tasks && tasks.length > 0 && (
            <PerPageSelector perPage={perPage} setPerPage={setPerPage} />
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
        <EmptyState title={t('rpa-dashboard')} description={t('no-records')} />
      ) : (
        <>
          <PiaAnalysis
            tasks={tasks}
            onCellClick={handleMatrixCellClick}
          />
          {matrixFilter && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                {t('filtered-by')}:{' '}
                {t(
                  piaDashboardConfig.find((c) => c.id === matrixFilter.category)
                    ?.titleKey || ''
                )}{' '}
                — {t(impactLabelKeys[matrixFilter.x])},{' '}
                {t(probabilityLabelKeys[matrixFilter.y])}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMatrixFilter(null)}
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
              prevRisk={taskToEdit.properties.pia_risk}
              onOpenChange={setIsEditOpen}
              tasks={tasks || []}
              selectedTask={taskToEdit}
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
    </>
  );
};

export default Dashboard;
