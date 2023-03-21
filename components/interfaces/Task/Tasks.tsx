import { Button } from "react-daisyui";
import { useTranslation } from "next-i18next";
import { Card, Error, Loading } from "@/components/ui";
import useTasks from "hooks/useTasks";
import statuses from "data/statuses.json";
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
  const { isLoading, isError, tasks } = useTasks();
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
    console.log('task in openEditModal', task)
    setTaskToEdit({...task})
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
                      <span className="underline">{task.id}</span>
                    </td>
                    <td className="px-6 py-3">{task.title}</td>
                    <td className="px-6 py-3">
                      {statuses.find(({value}) => value === task.status)?.label}
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