import { useState, useEffect } from 'react';
import { Button } from "react-daisyui";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Card, Error, Loading, StatusBadge } from "@/components/shared";
import useTasks from "hooks/useTasks";
import useCanAccess from 'hooks/useCanAccess';
import statuses from "@/components/defaultLanding/data/statuses.json"
import { WithLoadingAndError } from "@/components/shared";
// import CreateTask from './CreateTask';
import type { Task, Team } from "@prisma/client";
// import EditTask from './EditTask';
import { CreateTask, DeleteTask, EditTask } from "@/components/interfaces/Task";




const Tasks = ({
  team,
  // setTaskToDelete,
  // setDeleteVisible,
  // setTaskToEdit,
  // setEditVisible
}: {
  team: Team,
  // setTaskToDelete: (id: number | null) => void;
  // setDeleteVisible: (visible: boolean) => void;
  // setTaskToEdit: (task: Task) => void
  // setEditVisible: (visible: boolean) => void;
}) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { isLoading, isError, tasks } = useTasks(slug as string);
  // const { newTeam } = router.query as { newTeam: string };
  const [createTeamVisible, setCreateTeamVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task>({} as Task)
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null)

  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();

  useEffect(() => {
    if (slug) {
      setCreateTeamVisible(true);
    }
  }, [slug]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const openDeleteModal = async (id: number) => {
    setTaskToDelete(id)
    setDeleteVisible(true)
  };

  const openEditModal = async (task: Task) => {
    setTaskToEdit({ ...task })
    setEditVisible(true)
  }

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('all-tasks')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('task-listed')}
            </p>
          </div>

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
            </Button>
          }
        </div>
        <table className='text-sm table w-full border-b dark:border-base-200'>
          <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                {t("task-id")}
              </th>
              <th scope="col" className="px-6 py-3">
                {t("title")}
              </th>
              <th scope="col" className="px-6 py-3">
                {t("status")}
              </th>
              <th scope="col" className="px-6 py-3">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks &&
              tasks.map((task) => {
                return (
                  <tr
                    key={task.id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{task.taskNumber}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{task.title}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge
                        value={task.status}
                        label={statuses.find(({ value }) => value === task.status)?.label as string}
                      />
                      {/* {statuses.find(({ value }) => value === task.status)?.label} */}
                    </td>
                    <td className="px-6 py-3 btn-group">
                      {canAccess('task', ['update']) &&
                        <Button
                          className="dark:text-gray-100"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            openEditModal(task)
                          }}
                        >
                          {t("edit-task")}
                        </Button>
                      }
                      {canAccess('task', ['delete']) &&
                        <Button
                          className="dark:text-gray-100"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            openDeleteModal(task.id)
                          }}
                        >
                          {t("delete-task")}
                        </Button>
                      }
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <CreateTask visible={visible} setVisible={setVisible} team={team} />
        {editVisible && <EditTask visible={editVisible} setVisible={setEditVisible} team={team} task={taskToEdit} />}
        <DeleteTask visible={deleteVisible} setVisible={setDeleteVisible} taskId={taskToDelete} />
      </div>
    </WithLoadingAndError>
  );
};

export default Tasks;
