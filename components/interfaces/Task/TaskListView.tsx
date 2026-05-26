import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import type { Task } from 'types';
import { StatusBadge } from '@/components/shared';
import ModuleBadge from '@/components/shared/ModuleBadge';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { getTaskModules } from '@/lib/tasks';

const TaskListView = ({
  slug,
  pageData,
  currentPage,
  totalPages,
  goToPage,
  prevButtonDisabled,
  nextButtonDisabled,
  canUpdate,
  canDelete,
  onDeleteTask,
}: {
  slug: string;
  pageData: Task[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  prevButtonDisabled: boolean;
  nextButtonDisabled: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onDeleteTask: (taskNumber: number) => void;
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const formatDueDate = (value?: string | null) => {
    if (!value) return t('no-due-date');
    const [year, month, day] = value.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  return (
    <>
      <div className="[&_th]:whitespace-normal! [&_td]:whitespace-normal!">
        <div className="overflow-x-auto mt-2">
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
                      {formatDueDate(task.duedate)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex gap-2 justify-end">
                      {canUpdate && (
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
                      {canDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteTask(task.taskNumber)}
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
    </>
  );
};

export default TaskListView;
