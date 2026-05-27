import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import useCanAccess from 'hooks/useCanAccess';
import useTeamTasks from 'hooks/useTeamTasks';
import { useRouter } from 'next/router';
import { TaskProperties, TaskWithRmRisk } from 'types';
import { EmptyState, Error } from '@/components/shared';
import RisksTable from './RisksTable';
import DeleteRisk from './DeleteRisk';
import CreateRisk from './risk-form/RmRiskDialog';
import { Button } from '@/components/shadcn/ui/button';
import RmAnalysis from '../TeamDashboard/RmAnalysis';
import { impactLabelKeys, probabilityLabelKeys } from '@/lib/common';

interface RmMatrixFilter {
  x: number;
  y: number;
}

const transformToRange = (value: number): number => {
  return Math.floor(value / 20);
};

const Dashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { canAccess } = useCanAccess(slug as string);
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  //TODO: setPerPage
  const [perPage] = useState<number>(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRmRisk | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRmRisk | null>(null);

  const [matrixFilter, setMatrixFilter] = useState<RmMatrixFilter | null>(null);

  useEffect(() => {
    const { ix, iy } = router.query;
    if (ix && iy) {
      setMatrixFilter({ x: Number(ix), y: Number(iy) });
    }
  }, [router.query]);

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

  const handleMatrixCellClick = useCallback((x: number, y: number) => {
    setMatrixFilter((prev) =>
      prev?.x === x && prev?.y === y ? null : { x, y }
    );
  }, []);

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
        <div className="flex justify-end items-center my-1">
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
        //TODO: change title
        <EmptyState title={t('rpa-dashboard')} description={t('no-records')} />
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
                {t('filtered-by')}:{' '}
                {t(impactLabelKeys[matrixFilter.x])},{' '}
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
    </>
  );
};

export default Dashboard;
