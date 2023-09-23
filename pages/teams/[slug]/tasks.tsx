import type { NextPageWithLayout } from "types";
import type { InferGetServerSidePropsType } from "next"
import { Button } from "react-daisyui";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { Task } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { CreateTask, Tasks, DeleteTask, EditTask } from "@/components/interfaces/Task";
import { getTeam } from "models/team";
import useCanAccess from 'hooks/useCanAccess';


const AllTasks: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ team }) => {
  const [visible, setVisible] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null)

  const [editVisible, setEditVisible] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task>({} as Task)
  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();


  return (
    <>
      <div className="flex items-center justify-between">
        <h4>{t("all-tasks")}</h4>
        {canAccess('task', ['create']) &&
          <Button
            size="sm"
            color="primary"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t("create")}
          </Button>}
      </div>
      <CreateTask visible={visible} setVisible={setVisible} team={team} />
      {editVisible && <EditTask visible={editVisible} setVisible={setEditVisible} team={team} task={taskToEdit} />}
      <DeleteTask visible={deleteVisible} setVisible={setDeleteVisible} taskId={taskToDelete} />
      <Tasks
        setTaskToDelete={setTaskToDelete}
        setDeleteVisible={setDeleteVisible}
        setTaskToEdit={setTaskToEdit}
        setEditVisible={setEditVisible}
      />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;

  const slug = query.slug as string

  const team = await getTeam({ slug })

  //Hotfix for not serializable team props
  team.createdAt = team.createdAt.toString()
  team.updatedAt = team.updatedAt.toString()

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      team: team
    },
  };
};

export default AllTasks;
