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
import RpaTable from "@/components/interfaces/RPA/RpaTable";
import { CreateRPA } from "@/components/interfaces/RPA";
import { PerPageSelector } from "@/components/shared/atlaskit";
import { perPageOptions } from "@/components/defaultLanding/data/configs/rpa";
import DeleteRpa from "@/components/interfaces/RPA/DeleteRpa";

const RpaDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
    const router = useRouter();
    const { t } = useTranslation("common");
    const { slug } = router.query;
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PerPageSelector
            setPerPage={setPerPage}
            options={perPageOptions}
            placeholder="Rows per page"
            defaultValue={{
              label: "10",
              value: 10
            }}
          />
        </div>
        <RpaTable
          slug={slug as string}
          tasks={tasksWithProcedures}
          perPage={perPage}
          editHandler={onEditClickHandler}
          deleteHandler={onDeleteClickHandler}
        />
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
        }
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
