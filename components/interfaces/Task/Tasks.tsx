import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  Error,
  Loading,
  PerPageSelector,
  WithLoadingAndError,
} from '@/components/shared';
import useTasks from 'hooks/useTasks';
import useCanAccess from 'hooks/useCanAccess';
import usePagination from 'hooks/usePagination';
import type { ApiResponse, Task, Team } from 'types';
import { CreateTask } from '@/components/interfaces/Task';
import TaskFilters from '@/components/interfaces/Task/TaskFilters';
import { Button } from '@/components/shadcn/ui/button';
import { TeamTaskAnalysis } from '../TeamDashboard';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import toast from 'react-hot-toast';
import {
  DEFAULT_TASK_PRIORITY,
  hasTaskModule,
  isTaskModuleKey,
} from '@/lib/tasks';
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
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskListView from './TaskListView';
import TaskViewTabs, { type ActiveTaskView } from './TaskViewTabs';

const Tasks = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { isLoading, isError, tasks, mutateTasks } = useTasks(slug as string);
  const [visible, setVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<ActiveTaskView>('list');
  const [perPage, setPerPage] = useState<number>(10);
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);
  const canCreateTask = canAccess('task', ['create']);
  const canUpdateTask = canAccess('task', ['update']);
  const canDeleteTask = canAccess('task', ['delete']);
  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedModules.length > 0;
  const canReorderTasks = canUpdateTask && !hasActiveFilters;

  const filteredTasks = tasks?.filter((task) => {
    const statusMatch =
      !selectedStatuses.length || selectedStatuses.includes(task.status);
    const priorityMatch =
      !selectedPriorities.length ||
      selectedPriorities.includes(task.priority ?? DEFAULT_TASK_PRIORITY);
    const moduleMatch =
      !selectedModules.length ||
      selectedModules.some(
        (mod) =>
          isTaskModuleKey(mod) &&
          typeof task.properties === 'object' &&
          task.properties &&
          hasTaskModule(task.properties as Record<string, unknown>, mod)
      );
    return statusMatch && priorityMatch && moduleMatch;
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
    setDeleteVisible(false);
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

  const handleKanbanReorder = async (reorderedTasks: Task[]) => {
    const previousTasks = tasks || [];

    await mutateTasks(
      {
        data: reorderedTasks,
        error: null,
      } as ApiResponse<Task[]>,
      {
        revalidate: false,
      }
    );

    try {
      const res = await fetch(`/api/teams/${slug}/tasks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: reorderedTasks.map((task) => ({
            taskNumber: task.taskNumber,
            status: task.status,
            kanbanOrder: task.kanbanOrder,
          })),
        }),
      });

      const result = (await res.json()) as ApiResponse<Task[]>;

      if (!res.ok || result.error) {
        await mutateTasks(
          {
            data: previousTasks,
            error: null,
          } as ApiResponse<Task[]>,
          {
            revalidate: false,
          }
        );
        toast.error(result.error?.message || t('errors.requestFailed'));
        return;
      }

      await mutateTasks(result, {
        revalidate: false,
      });
    } catch {
      await mutateTasks(
        {
          data: previousTasks,
          error: null,
        } as ApiResponse<Task[]>,
        {
          revalidate: false,
        }
      );
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
            selectedPriorities={selectedPriorities}
            setSelectedPriorities={setSelectedPriorities}
            selectedModules={selectedModules}
            setSelectedModules={setSelectedModules}
          />
          <div className="flex justify-end items-center gap-2 my-1 flex-wrap">
            {activeView === 'list' && tasks && tasks.length > 0 && (
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
            {canCreateTask && (
              <Button variant="outline" onClick={() => setImportVisible(true)}>
                {t('import-tasks')}
              </Button>
            )}
            {canCreateTask && (
              <Button color="primary" onClick={() => setVisible(!visible)}>
                {t('create')}
              </Button>
            )}
          </div>
        </div>
        <TeamTaskAnalysis slug={slug} />
        <TaskViewTabs activeView={activeView} setActiveView={setActiveView} />
        {activeView === 'list' ? (
          <TaskListView
            slug={slug}
            pageData={pageData}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            prevButtonDisabled={prevButtonDisabled}
            nextButtonDisabled={nextButtonDisabled}
            canUpdate={canUpdateTask}
            canDelete={canDeleteTask}
            onDeleteTask={openDeleteModal}
          />
        ) : (
          <TaskKanbanBoard
            slug={slug}
            tasks={filteredTasks || []}
            canUpdate={canUpdateTask}
            canDelete={canDeleteTask}
            canReorder={canReorderTasks}
            onDeleteTask={openDeleteModal}
            onReorder={handleKanbanReorder}
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
