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
import {
  TiaTable,
  DeleteProcedure,
  CreateProcedure,
} from '@/components/interfaces/TIA';
import { PerPageSelector } from '@/components/shared';
import { Button } from '@/components/shadcn/ui/button';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import { TeamAssessmentAnalysis } from '@/components/interfaces/TeamDashboard';

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

  if (!canAccess('tia', ['read'])) {
    return <Error message={t('forbidden-resource')} />;
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('tia-dashboard')}
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
                setIsCreateOpen(true);
              }}
            >
              {t('create')}
            </Button>
          )}
        </div>
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
        <EmptyState title={t('tia-dashboard')} description="No records" />
      ) : (
        <>
          <div className="m-2">
            <TeamAssessmentAnalysis slug={slug as string} />
          </div>
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
