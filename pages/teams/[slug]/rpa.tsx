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
import type { TaskWithRpaProcedure, TaskProperties } from 'types';
import {
  RpaTable,
  DeleteProcedure,
  CreateProcedureTest,
} from '@/components/interfaces/RPA';
import { PerPageSelector } from '@/components/shared';
import useRpaCreation from 'hooks/useRpaCreation';
import { Button } from '@/components/shadcn/ui/button';
import ProcessingActivitiesAnalysis from '@/components/interfaces/TeamDashboard/TeamProcessingActivities';

const RpaDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { slug } = router.query;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRpaProcedure | null>(
    null
  );
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRpaProcedure | null>(
    null
  );

  const rpaState = useRpaCreation();

  const [perPage, setPerPage] = useState<number>(10);

  const { isLoading, isError, team } = useTeam(slug as string);

  const { tasks, mutateTasks } = useTeamTasks(slug as string);

  const onEditClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    setTaskToEdit(task);
    rpaState.setIsRpaOpen(true);
  }, []);

  const onDeleteClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  }, []);

  const tasksWithProcedures = useMemo(() => {
    if (!tasks) {
      return [];
    }
    return tasks.filter((tasks) => {
      const taskProperties = tasks.properties as TaskProperties;
      const procedure = taskProperties.rpa_procedure;
      return procedure;
    }) as TaskWithRpaProcedure[];
  }, [tasks]);

  if (isLoading || !team || !tasks) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  if (!canAccess('rpa', ['read'])) {
    return <Error message={t('forbidden-resource')} />;
  }

  return (
    <>
      {/* <h3 className="text-2xl font-bold">{"Records of Processing Activities Dashboard"}</h3> */}
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('rpa-dashboard')}
          </h2>
        </div>
        <div className="flex justify-end items-center my-1">
          {tasksWithProcedures.length > 0 && (
            <PerPageSelector perPage={perPage} setPerPage={setPerPage} />
          )}
          {canAccess('task', ['update']) && (
            <Button
              color="primary"
              onClick={() => {
                setTaskToEdit(null);
                rpaState.setIsRpaOpen(true);
              }}
            >
              {t('create')}
            </Button>
          )}
        </div>
      </div>
      <CreateProcedureTest
        tasks={tasks}
        mutateTasks={mutateTasks}
        {...rpaState}
        selectedTask={taskToEdit || rpaState.selectedTask}
      />
      {tasksWithProcedures.length === 0 ? (
        <EmptyState title={t('rpa-dashboard')} description="No records" />
      ) : (
        <>
          <div className="m-2">
            <ProcessingActivitiesAnalysis slug={slug as string} />
          </div>
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

export default RpaDashboard;
