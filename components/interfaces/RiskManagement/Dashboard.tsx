import { useCallback, useMemo, useState } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import useCanAccess from 'hooks/useCanAccess';
import { Team } from '@prisma/client';
import CreateRisk from './CreateRisk';
import useTeamTasks from 'hooks/useTeamTasks';
import { useRouter } from 'next/router';
import { TaskProperties, TaskWithRmRisk } from 'types';
import { EmptyState, Error } from '@/components/shared';
import RisksTable from './RisksTable';
import DeleteRisk from './DeleteRisk';

interface DashboardProps {
  team: Team;
}

const Dashboard = ({ team }: DashboardProps) => {
  const { canAccess } = useCanAccess();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const [perPage, setPerPage] = useState<number>(10);

  console.log('tasks', tasks);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRmRisk | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRmRisk | null>(null);

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

  const onEditClickHandler = useCallback((task: TaskWithRmRisk) => {
    setTaskToEdit(task);
    setIsEditOpen(true);
  }, []);

  const onDeleteClickHandler = useCallback((task: TaskWithRmRisk) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  }, []);

  if (!canAccess('rm', ['read'])) {
    return <Error message={t('forbidden-resource')} />;
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
              size="sm"
              color="primary"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(true);
              }}
            >
              {t('create')}
            </Button>
          )}
        </div>
      </div>
      {isCreateOpen && tasks && (
        <CreateRisk
          tasks={tasks}
          visible={isCreateOpen}
          setVisible={setIsCreateOpen}
          mutateTasks={mutateTasks}
        />
      )}
      {tasksWithRisks.length === 0 ? (
        //TODO: change title
        <EmptyState title={t('rpa-dashboard')} description="No records" />
      ) : (
        <>
          <RisksTable
            slug={slug as string}
            tasks={tasksWithRisks}
            perPage={perPage}
            editHandler={onEditClickHandler}
            deleteHandler={onDeleteClickHandler}
          />
          {taskToEdit && isEditOpen && (
            <CreateRisk
              tasks={tasks || []}
              visible={isEditOpen}
              setVisible={setIsEditOpen}
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
