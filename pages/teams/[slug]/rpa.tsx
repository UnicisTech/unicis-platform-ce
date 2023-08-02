import type { NextPageWithLayout } from "types";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Loading, Error } from "@/components/shared";
import type { InferGetServerSidePropsType } from "next"
import useTeam from "hooks/useTeam";
import useTeamMembers from "hooks/useTeamMembers";
import { GetServerSidePropsContext } from "next";
import useTeamTasks from "hooks/useTeamTasks";
import type { TaskWithRpaProcedure } from "types";
import { CreateRPA, RpaTable, DeleteRpa, DashboardCreateRPA } from "@/components/interfaces/RPA";
import { PerPageSelector } from "@/components/shared/atlaskit";
import { perPageOptions } from "@/components/defaultLanding/data/configs/rpa";
import { Button } from "react-daisyui";

const RpaDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { slug } = router.query;
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRpaProcedure | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRpaProcedure | null>(null)
  const [perPage, setPerPage] = useState<number>(10)

  const { isLoading, isError, team } = useTeam(slug as string);
  const { members: members, isLoading: isMembersLoading, isError: isMembersError } = useTeamMembers(slug as string)


  const { tasks, mutateTasks } = useTeamTasks(slug as string)
  const tasksWithProcedures = useMemo<Array<TaskWithRpaProcedure>>(() => {
    if (!tasks) {
      return []
    }
    return tasks.filter(task => {
      const taskProperties = task.properties as any
      const procedure = taskProperties.rpa_procedure
      return procedure
    }) as TaskWithRpaProcedure[]
  }, [tasks])

  const onEditClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    setTaskToEdit(task)
    setIsEditOpen(true)
  }, [])

  const onDeleteClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    setTaskToDelete(task)
    setIsDeleteOpen(true)
  }, [])

  if (isLoading || !team || !tasks || isMembersLoading) {
    return <Loading />;
  }

  if (isError || isMembersError) {
    return <Error />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold">{"Records of Processing Activities Dashboard"}</h3>
      {tasksWithProcedures.length === 0
        ? <div className="flex flex-col items-center justify-center rounded-md lg:p-20 border-2 border-dashed gap-3 bg-white h-30 border-slate-600 m-5">
          <h3 className='text-semibold text-emphasis text-center text-xl'>No records</h3>
        </div>
        : <>
          <div className="flex justify-end items-center my-1">
            <PerPageSelector
              setPerPage={setPerPage}
              options={perPageOptions}
              placeholder="Rows per page"
              defaultValue={{
                label: "10",
                value: 10
              }}
            />
            <Button
              size="sm"
              color="primary"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(true);
              }}
            >
              {t("create")}
            </Button>
          </div>
          <RpaTable
            slug={slug as string}
            tasks={tasksWithProcedures}
            perPage={perPage}
            editHandler={onEditClickHandler}
            deleteHandler={onDeleteClickHandler}
          />
          {isCreateOpen &&
            <DashboardCreateRPA
              visible={isCreateOpen}
              setVisible={setIsCreateOpen}
              tasks={tasks}
              //task={taskToEdit as Task}
              members={members}
              mutate={mutateTasks}
            />
          }
          {taskToEdit && isEditOpen &&
            <CreateRPA
              visible={isEditOpen}
              setVisible={setIsEditOpen}
              task={taskToEdit as TaskWithRpaProcedure}
              members={members}
              mutate={mutateTasks}
            />
          }
          {taskToDelete && isDeleteOpen &&
            <DeleteRpa
              visible={isDeleteOpen}
              setVisible={setIsDeleteOpen}
              task={taskToDelete as TaskWithRpaProcedure}
              mutate={mutateTasks}
            />
          }</>}

    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {})
    },
  };
};

export default RpaDashboard;
