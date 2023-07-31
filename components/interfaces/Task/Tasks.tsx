import { Button } from "react-daisyui";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Card, Error, Loading, StatusBadge } from "@/components/shared";
import useTasks from "hooks/useTasks";
import statuses from "@/components/defaultLanding/data/statuses.json"
import type { Task } from "@prisma/client";

const Tasks = ({
  setTaskToDelete,
  setDeleteVisible,
  setTaskToEdit,
  setEditVisible
}: {
  setTaskToDelete: (id: number | null) => void;
  setDeleteVisible: (visible: boolean) => void;
  setTaskToEdit: (task: Task) => void
  setEditVisible: (visible: boolean) => void;
}) => {
  const router = useRouter();
  const { slug } = router.query;
  const { isLoading, isError, tasks } = useTasks(slug as string);

  const { t } = useTranslation("common");

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
    <Card heading="Teams Tasks">
      <Card.Body>
        <table className="w-full table-fixed text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          openEditModal(task)
                        }}
                      >
                        {t("edit-task")}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          openDeleteModal(task.id)
                        }}
                      >
                        {t("delete-task")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

export default Tasks;
