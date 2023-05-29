import type { NextPageWithLayout } from "types";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import axios from "axios";
import toast from "react-hot-toast";
import { Loading, Error } from "@/components/ui";
import type { InferGetServerSidePropsType } from "next"
import useTeam from "hooks/useTeam";
import useTeamMembers from "hooks/useTeamMembers";
import { GetServerSidePropsContext } from "next";
import {
  StatusesTable,
  PieChart,
  RadarChart,
  SectionFilter,
  StatusFilter,
} from "@/components/interfaces/CSC";
import useTeamTasks from "hooks/useTeamTasks";
import { getCscStatusesBySlug } from "models/team";
import type { Option, TaskWithRpaProcedure } from "types";
import RpaTable from "@/components/interfaces/RPA/RpaTable";
import { CreateRPA } from "@/components/interfaces/RPA";
import { Task } from "@prisma/client";
import { PerPageSelector } from "@/components/ui/atlaskit";
import { perPageOptions } from "data/configs/rpa";
import DeleteRpa from "@/components/interfaces/RPA/DeleteRpa";
import { Button } from "react-daisyui";

const RpaDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ 
                  csc_statuses 
                }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { slug } = router.query;
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRpaProcedure | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRpaProcedure | null>(null)
  const [perPage, setPerPage] = useState<number>(10)


  const [statuses, setStatuses] = useState(csc_statuses)
  const [isSaving, setIsSaving] = useState(false)
  const [sectionFilter, setSectionFilter] = useState<null | {label: string, value: string}[]>(null)
  const [statusFilter, setStatusFilter] = useState<null | Option[]>(null)
  //const [perPage, setPerPage] = useState<number>(10)


  const { isLoading, isError, team } = useTeam(slug as string);
  const {members: members, isLoading: isMembersLoading, isError: isMembersError} = useTeamMembers(slug as string)

  
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

  console.log('tasksWithProcedures -->', tasksWithProcedures)
  useEffect(() => {
    console.log('tasks mutated:', tasks)
  }, [tasks])

  const statusHandler = useCallback(async (control: string, value: string) => {
    setIsSaving(true)
    const response = await axios.put(
      `/api/teams/${slug}/csc`,
      {
        control,
        value,
      }
    );

    const { data, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    setStatuses(data.statuses)
    setIsSaving(false)
  }, [])

  const onEditClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    console.log('onEditClickHandler', task)
    setTaskToEdit(task)
    setIsEditOpen(true)
  }, [])

  const onDeleteClickHandler = useCallback((task: TaskWithRpaProcedure) => {
    console.log('onDeleteClickHandler')
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
      <div className="flex items-center justify-between">
        <h4>{"Records of Processing Activities Dashboard: "}{team.name}</h4>
        <Button
            size="sm"
            color="primary"
            className="text-white"
            onClick={() => {
              setRpaVisible(!rpaVisible);
            }}
          >
            {t("create-rpa")}
          </Button>
      </div>
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
        isSaving={false}
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
      {/* <div style={{ height: '400px', width: '100%', display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
        <div style={{width: '50%'}}>
          <PieChart statuses={statuses} />
        </div>
        <div style={{width: '50%'}}>
          <RadarChart statuses={statuses} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SectionFilter setSectionFilter={setSectionFilter} />
        <StatusFilter setStatusFilter={setStatusFilter} />
        <PerPageSelector setPerPage={setPerPage} />
      </div>
      <StatusesTable
        tasks={tasks}
        statuses={statuses}
        sectionFilter={sectionFilter}
        statusFilter={statusFilter}
        perPage={perPage}
        isSaving={isSaving}
        statusHandler={statusHandler}
        taskSelectorHandler={taskSelectorHandler}
      /> */}
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
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
};

export default RpaDashboard;
