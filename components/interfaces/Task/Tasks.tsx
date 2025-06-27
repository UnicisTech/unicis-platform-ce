import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  Error,
  Loading,
  PerPageSelector,
  StatusBadge,
  WithLoadingAndError,
} from '@/components/shared';
import useTasks from 'hooks/useTasks';
import useCanAccess from 'hooks/useCanAccess';
import usePagination from 'hooks/usePagination';
import statuses from '@/components/defaultLanding/data/statuses.json';
import type { Task, Team } from '@prisma/client';
import { CreateTask, DeleteTask } from '@/components/interfaces/Task';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import ModuleBadge from '@/components/shared/ModuleBadge';
import TaskFilters from '@/components/interfaces/Task/TaskFilters';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { Button } from '@/components/shadcn/ui/button';
import { TeamTaskAnalysis } from '../TeamDashboard';

const Tasks = ({ team, csc_statuses }: { team: Team; csc_statuses: any }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { isLoading, isError, tasks } = useTasks(slug as string);
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [perPage, setPerPage] = useState<number>(10);
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();

  const filteredTasks = tasks?.filter((task) => {
    const statusMatch =
      !selectedStatuses.length || selectedStatuses.includes(task.status);
    const moduleMatch =
      !selectedModules.length ||
      selectedModules.some(
        (mod) =>
          typeof task.properties === 'object' &&
          task.properties &&
          mod in task.properties
      );
    return statusMatch && moduleMatch;
  });

  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<Task>(filteredTasks || [], perPage);

  useEffect(() => {
    console.log('tasks', tasks);
  }, [tasks]);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const openDeleteModal = async (id: number) => {
    setTaskToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <h2 className="text-xl font-medium leading-none tracking-tight">
          {t('all-tasks')}
        </h2>
        <TeamTaskAnalysis
          slug={slug}
          csc_statuses={csc_statuses as { [key: string]: string }}
        />
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('task-listed')}
            </p>
          </div>
          <div className="flex justify-end items-center my-1">
            {tasks && tasks.length > 0 && (
              <PerPageSelector perPage={perPage} setPerPage={setPerPage} />
            )}
            {canAccess('task', ['create']) && (
              <Button color="primary" onClick={() => setVisible(!visible)}>
                {t('create')}
              </Button>
            )}
          </div>
        </div>
        <TaskFilters
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedModules={selectedModules}
          setSelectedModules={setSelectedModules}
        />

        <table className="w-full min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="w-1/10 px-4 py-2 text-left">{t('task-id')}</th>
              <th className="w-2/5 px-4 py-2 text-left">{t('title')}</th>
              <th className="w-1/10 px-4 py-2 text-left">{t('status')}</th>
              <th className="w-1/10 px-4 py-2 text-left">{t('due-date')}</th>
              <th className="w-1/5 px-4 py-2 text-left">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-2">
                  <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                    <span className="underline">{task.taskNumber}</span>
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                      <span className="underline font-medium">
                        {task.title}
                      </span>
                    </Link>
                    {[
                      'rpa_procedure',
                      'tia_procedure',
                      'pia_risk',
                      'rm_risk',
                    ].map((key) =>
                      typeof task.properties === 'object' &&
                      task.properties &&
                      key in task.properties &&
                      (task.properties as any)[key] ? (
                        <ModuleBadge key={key} propName={key} />
                      ) : null
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <StatusBadge
                    value={task.status}
                    label={
                      statuses.find(({ value }) => value === task.status)
                        ?.label || task.status
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <span className="text-sm">
                    {task.duedate
                      ? new Date(task.duedate).toLocaleDateString()
                      : t('no-due-date')}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="btn-group">
                    {canAccess('task', ['update']) && (
                      <DaisyButton
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/teams/${slug}/tasks/${task.taskNumber}`)
                        }
                      >
                        {t('edit-task')}
                      </DaisyButton>
                    )}
                    {canAccess('task', ['delete']) && (
                      <DaisyButton
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(task.taskNumber)}
                      >
                        {t('delete')}
                      </DaisyButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pageData.length > 0 && (
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            onChange={goToPage}
            prevButtonDisabled={prevButtonDisabled}
            nextButtonDisabled={nextButtonDisabled}
          />
        )}

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
