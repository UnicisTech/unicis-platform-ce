import type { NextPageWithLayout } from 'types';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error } from '@/components/shared';
import type { InferGetServerSidePropsType } from 'next';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import useTeamTasks from 'hooks/useTeamTasks';
import useCanAccess from 'hooks/useCanAccess';
import type { TaskWithRpaProcedure, TaskProperties } from 'types';
import {
  CreateRPA,
  RpaTable,
  DeleteRpa,
  DashboardCreateRPA,
} from '@/components/interfaces/RPA';
import { Button } from 'react-daisyui';
import { PerPageSelector } from '@/components/shared';

const RpaDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { slug } = router.query;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRpaProcedure | null>(
    null
  );
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRpaProcedure | null>(
    null
  );
  const [perPage, setPerPage] = useState<number>(10);

  const { isLoading, isError, team } = useTeam(slug as string);

  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const tasksWithProcedures = useMemo<Array<TaskWithRpaProcedure>>(() => {
    if (!tasks) {
      return [];
    }
    return tasks.filter((task) => {
      const taskProperties = task.properties as TaskProperties;
      const procedure = taskProperties.rpa_procedure;
      return procedure;
    }) as TaskWithRpaProcedure[];
  }, [tasks]);

  const onEditClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    setTaskToEdit(task);
    setIsEditOpen(true);
  }, []);

  const onDeleteClickHandler = useCallback((task: TaskWithRpaProcedure) => {
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
      {/* <h3 className="text-2xl font-bold">{"Records of Processing Activities Dashboard"}</h3> */}
      {tasksWithProcedures.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md lg:p-20 border-2 border-dashed gap-3 bg-white h-30 border-slate-600 m-5">
          <h3 className="text-2xl font-bold">
            {'Records of Processing Activities Dashboard'}
          </h3>
          <h5 className="text-semibold text-emphasis text-center text-xl">
            No records
          </h5>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                Transfer Impact Assessment Dashboard
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
          <RpaTable
            slug={slug as string}
            tasks={tasksWithProcedures}
            perPage={perPage}
            editHandler={onEditClickHandler}
            deleteHandler={onDeleteClickHandler}
          />
          {isCreateOpen && (
            <DashboardCreateRPA
              visible={isCreateOpen}
              setVisible={setIsCreateOpen}
              tasks={tasks}
              //task={taskToEdit as Task}
              mutate={mutateTasks}
            />
          )}
          {taskToEdit && isEditOpen && (
            <CreateRPA
              visible={isEditOpen}
              setVisible={setIsEditOpen}
              task={taskToEdit as TaskWithRpaProcedure}
              mutate={mutateTasks}
            />
          )}
          {taskToDelete && isDeleteOpen && (
            <DeleteRpa
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
