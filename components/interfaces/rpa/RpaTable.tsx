import React from 'react';
import Link from 'next/link';
import type { TaskWithRpaProcedure } from 'types';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { Badge } from '@/components/shadcn/ui/badge';
import { Error, Loading, MemberName, StatusBadge } from '@/components/shared';
import { Button } from '@/components/shadcn/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import useTeamMembersMap from 'hooks/useTeamMembersMap';

const RpaTable = ({
  slug,
  tasks,
  perPage,
  editHandler,
  deleteHandler,
}: {
  slug: string;
  tasks: Array<TaskWithRpaProcedure>;
  perPage: number;
  editHandler: (task: TaskWithRpaProcedure) => void;
  deleteHandler: (task: TaskWithRpaProcedure) => void;
}) => {
  const { canAccess } = useCanAccess(slug);
  const { t } = useTranslation('common');
  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<TaskWithRpaProcedure>(tasks, perPage);
  const { isLoading, isError, membersById } = useTeamMembersMap(slug);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError?.message} />;
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden [&_th]:whitespace-normal! [&_td]:whitespace-normal!">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('rpa')}</th>
              <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('status')}</th>
              <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('rpa-dpo')}</th>
              <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('rpa-review')}</th>
              <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t('rpa-data-tranfer')}
              </th>
              <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('rpa-category')}</th>
              {canAccess('task', ['update']) && (
                <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('actions')}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {pageData.map((task) => (
              <tr key={task.id}>
                <td className="px-1.5 py-1.5">
                  <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                    <span className="underline">{task.title}</span>
                  </Link>
                </td>
                <td className="px-1.5 py-1.5">
                  <StatusBadge
                    label={t(`task-statuses.${task.status}`)}
                    value={task.status}
                  />
                </td>
                <td className="px-1.5 py-1.5">
                  <MemberName
                    userId={task.properties.rpa_procedure?.[0]?.dpo}
                    membersById={membersById}
                    fallback={t('not-found')}
                  />
                </td>
                <td className="px-1.5 py-1.5">
                  <Badge variant="outline">
                    {task.properties.rpa_procedure[0].reviewDate}
                  </Badge>
                </td>
                <td className="px-1.5 py-1.5">
                  <Badge
                    variant={
                      task.properties.rpa_procedure[3].datatransfer
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {task.properties.rpa_procedure[3].datatransfer
                      ? t('enabled')
                      : t('disabled')}
                  </Badge>
                </td>
                <td className="px-1.5 py-1.5">
                  <div className="flex flex-col gap-1">
                    {task.properties.rpa_procedure[1].specialcategory.map(
                      (cat, i) => (
                        <Badge key={i} variant="secondary">
                          {t(`rpa:special-category.${cat}`)}
                        </Badge>
                      )
                    )}
                  </div>
                </td>
                {canAccess('task', ['update']) && (
                  <td className="px-1.5 py-1.5">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => editHandler(task)}
                        aria-label={t('edit-task')}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteHandler(task)}
                        aria-label={t('delete')}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
};

export default RpaTable;
