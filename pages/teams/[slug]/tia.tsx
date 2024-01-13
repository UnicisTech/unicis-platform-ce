import type { NextPageWithLayout } from 'types';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, EmptyState } from '@/components/shared';
import type { InferGetServerSidePropsType } from 'next';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import useTeamTasks from 'hooks/useTeamTasks';
import useCanAccess from 'hooks/useCanAccess';
import type { TaskWithTiaProcedure, TaskProperties } from 'types';
import { CreateTIA, TiaTable, DeleteTia } from '@/components/interfaces/TIA';
import { Button } from 'react-daisyui';
import { DashboardCreateTIA } from '@/components/interfaces/TIA';
import { PerPageSelector } from '@/components/shared';

const TiaDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { slug } = router.query;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  return (
    <>
      {tasksWithProcedures.length === 0 ? (
        <EmptyState title={t('tia-dashboard')} description="No records" />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('tia-dashboard')}
              </h2>
            </div>
            <div className="flex justify-end items-center my-1">
              <PerPageSelector perPage={perPage} setPerPage={setPerPage} />
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
          <TiaTable
            slug={slug as string}
            tasks={tasksWithProcedures}
            perPage={perPage}
            editHandler={onEditClickHandler}
            deleteHandler={onDeleteClickHandler}
          />
          {isCreateOpen && (
            <DashboardCreateTIA
              visible={isCreateOpen}
              setVisible={setIsCreateOpen}
              tasks={tasks}
              mutate={mutateTasks}
            />
          )}
          {taskToEdit && isEditOpen && (
            <CreateTIA
              visible={isEditOpen}
              setVisible={setIsEditOpen}
              task={taskToEdit as TaskWithTiaProcedure}
              mutate={mutateTasks}
            />
          )}
          {taskToDelete && isDeleteOpen && (
            <DeleteTia
              visible={isDeleteOpen}
              setVisible={setIsDeleteOpen}
              task={taskToDelete as TaskWithTiaProcedure}
              mutate={mutateTasks}
            />
          )}
        </>
      )}
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default TiaDashboard;
