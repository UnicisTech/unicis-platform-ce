import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  Error,
  Loading,
  PerPageSelector,
  StatusBadge,
} from '@/components/shared';
import useTasks from 'hooks/useTasks';
import useCanAccess from 'hooks/useCanAccess';
import usePagination from 'hooks/usePagination';
import statuses from '@/components/defaultLanding/data/statuses.json';
import { WithLoadingAndError } from '@/components/shared';
import type { Task, Team } from '@prisma/client';
import { CreateTask, DeleteTask } from '@/components/interfaces/Task';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';

const Tasks = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { isLoading, isError, tasks } = useTasks(slug as string);
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null);

  const [perPage, setPerPage] = useState<number>(10);
  // const [statusFilter, setStatusFilter] = useState<string>('')

  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<Task>(tasks || [], perPage);

  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const openDeleteModal = async (id: number) => {
    setTaskToDelete(id);
    setDeleteVisible(true);
  };

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
          <div className="flex justify-end items-center my-1">
            {/* <StatusFilter 
              options={[{label: 'test', value: 'test'}]}
              handler={setStatusFilter}
              value={statusFilter}
            /> */}
            {tasks && tasks.length > 0 && (
              <PerPageSelector perPage={perPage} setPerPage={setPerPage} />
            )}
            {canAccess('task', ['create']) && (
              <DaisyButton
                size="sm"
                color="primary"
                variant="outline"
                onClick={() => {
                  setVisible(!visible);
                }}
              >
                {t('create')}
              </DaisyButton>
            )}
          </div>
        </div>
        <table className="w-full min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="w-1/5 px-4 py-2 text-left">
                {t('task-id')}
              </th>
              <th className="w-2/5 px-4 py-2 text-left">
                {t('title')}
              </th>
              <th className="w-[15%] px-4 py-2 text-left">
                {t('status')}
              </th>
              <th className="w-1/4 px-4 py-2 text-left">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((task) => {
              return (
                <tr key={task.id}>
                  <td className="px-4 py-2">
                    <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                      <div className="flex items-center justify-start space-x-2">
                        <span className="underline">{task.taskNumber}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                      <div className="flex items-center justify-start space-x-2">
                        <span className="underline">{task.title}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge
                      value={task.status}
                      label={
                        statuses.find(({ value }) => value === task.status)
                          ?.label as string
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className=" btn-group">
                      {canAccess('task', ['update']) && (
                        <DaisyButton
                          className="dark:text-gray-100"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            router.push(
                              `/teams/${slug}/tasks/${task.taskNumber}`
                            );
                          }}
                        >
                          {t('edit-task')}
                        </DaisyButton>
                      )}
                      {canAccess('task', ['delete']) && (
                        <DaisyButton
                          className="dark:text-gray-100"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            openDeleteModal(task.taskNumber);
                          }}
                        >
                          {t('delete')}
                        </DaisyButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pageData.length ? (
          <div className="flex justify-center w-30">
            <div className="btn-group join grid grid-cols-10">
              <button
                className="join-item btn btn-outline col-span-4"
                onClick={goToPreviousPage}
                disabled={prevButtonDisabled}
              >
                Previous page
              </button>
              <button className="join-item btn btn-outline col-span-2">{`${currentPage}/${totalPages}`}</button>
              <button
                className="join-item btn btn-outline col-span-4"
                onClick={goToNextPage}
                disabled={nextButtonDisabled}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
        <CreateTask visible={visible} setVisible={setVisible} team={team} />
        <DeleteTask
          visible={deleteVisible}
          setVisible={setDeleteVisible}
          taskNumber={taskToDelete}
        />
      </div>
    </WithLoadingAndError>
  );
};

export default Tasks;
