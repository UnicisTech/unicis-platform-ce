import { useState } from 'react';
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
import type { Task, Team } from '@/generated/browser';
import { CreateTask } from '@/components/interfaces/Task';
import ModuleBadge from '@/components/shared/ModuleBadge';
import TaskFilters from '@/components/interfaces/Task/TaskFilters';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { Button } from '@/components/shadcn/ui/button';
import { TeamTaskAnalysis } from '../TeamDashboard';
import { Badge } from '@/components/shadcn/ui/badge';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import toast from 'react-hot-toast';
import { getTaskModules, hasTaskModule, isTaskModuleKey } from '@/lib/tasks';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import TaskImportModal from './TaskImportModal';
import {
  exportTasksXlsx,
  exportTasksCsv,
  exportTasksHtml,
  exportTasksPdf,
} from '@/lib/tasks/exportTasks';

const Tasks = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { isLoading, isError, tasks, mutateTasks } = useTasks(slug as string);
  const [visible, setVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [perPage, setPerPage] = useState<number>(10);
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);

  const filteredTasks = tasks?.filter((task) => {
    const statusMatch =
      !selectedStatuses.length || selectedStatuses.includes(task.status);
    const moduleMatch =
      !selectedModules.length ||
      selectedModules.some(
        (mod) =>
          isTaskModuleKey(mod) &&
          typeof task.properties === 'object' &&
          task.properties &&
          hasTaskModule(task.properties as Record<string, unknown>, mod)
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

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const openDeleteModal = async (id: number) => {
    setTaskToDelete(id);
    setDeleteVisible(true);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/teams/${slug}/tasks/${taskToDelete}`, {
      method: 'DELETE',
    });

    const { error } = await res.json();
    if (!res.ok || error) {
      toast.error(error?.message || t('errors.requestFailed'));
      return;
    }

    toast.success(t('task-deleted'));
    mutateTasks();
    setVisible(false);
  };

  const handleExport = async (format: 'xlsx' | 'csv' | 'html' | 'pdf') => {
    if (!tasks || tasks.length === 0) return;
    const teamName = team.name;
    try {
      if (format === 'xlsx') await exportTasksXlsx(tasks, teamName);
      else if (format === 'csv') exportTasksCsv(tasks, teamName);
      else if (format === 'html') exportTasksHtml(tasks, teamName);
      else if (format === 'pdf') exportTasksPdf(tasks, teamName);
    } catch {
      toast.error(t('errors.requestFailed'));
    }
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <h2 className="text-xl font-medium leading-none tracking-tight">
          {t('all-tasks')}
        </h2>
        <div className="flex flex-col lg:flex-row justify-between items-end items-center">
          <TaskFilters
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            selectedModules={selectedModules}
            setSelectedModules={setSelectedModules}
          />
          <div className="flex justify-end items-center gap-2 my-1 flex-wrap">
            {tasks && tasks.length > 0 && (
              <PerPageSelector perPage={perPage} setPerPage={setPerPage} />
            )}
            {tasks && tasks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {t('export-tasks')}
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    {t('export-excel')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    {t('export-csv')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('html')}>
                    {t('export-html')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    {t('export-pdf')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {canAccess('task', ['create']) && (
              <Button variant="outline" onClick={() => setImportVisible(true)}>
                {t('import-tasks')}
              </Button>
            )}
            {canAccess('task', ['create']) && (
              <Button color="primary" onClick={() => setVisible(!visible)}>
                {t('create')}
              </Button>
            )}
          </div>
        </div>
        <TeamTaskAnalysis slug={slug} />
        <div className="[&_th]:whitespace-normal! [&_td]:whitespace-normal!">
          <div className="overflow-x-auto mt-2">
            <table className="w-full min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="w-1/10 px-4 py-2 text-left">{t('task-id')}</th>
                  <th className="w-2/5 px-4 py-2 text-left">{t('title')}</th>
                  <th className="w-1/10 px-4 py-2 text-left">{t('status')}</th>
                  <th className="w-1/10 px-4 py-2 text-left">
                    {t('due-date')}
                  </th>
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
                        {typeof task.properties === 'object' &&
                          task.properties &&
                          getTaskModules(
                            task.properties as Record<string, unknown>
                          ).map((key) => (
                            <ModuleBadge key={key} propName={key} />
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge
                        value={task.status}
                        label={t(`task-statuses.${task.status}`)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">
                        {task.duedate
                          ? new Date(task.duedate).toLocaleDateString()
                          : t('no-due-date')}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex gap-2 justify-end">
                        {canAccess('task', ['update']) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/teams/${slug}/tasks/${task.taskNumber}`
                              )
                            }
                          >
                            {t('edit-task')}
                          </Button>
                        )}
                        {canAccess('task', ['delete']) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteModal(task.taskNumber)}
                          >
                            {t('delete')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
        <TaskImportModal
          visible={importVisible}
          setVisible={setImportVisible}
          team={team}
        />
        <ConfirmationDialog
          title="Delete task"
          visible={deleteVisible}
          onConfirm={handleDelete}
          onCancel={() => setDeleteVisible(false)}
        >
          {t('delete-task-warning')}
        </ConfirmationDialog>
      </div>
    </WithLoadingAndError>
  );
};

export default Tasks;
