import React from 'react';
import Link from 'next/link';
import statuses from '@/components/defaultLanding/data/statuses.json';
import type { TaskWithRpaProcedure } from 'types';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { Badge } from '@/components/shadcn/ui/badge';
import { StatusBadge } from '@/components/shared';

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
  const { canAccess } = useCanAccess();
  const { t } = useTranslation('common');
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<TaskWithRpaProcedure>(tasks, perPage);

  // const getStatusLabel = (value: string) =>
  //   statuses.find((s) => s.value === value)?.label || value;

  return (
    <div className="[&_th]:whitespace-normal! [&_td]:whitespace-normal!">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-1.5 py-1.5 text-left">{t('rpa')}</th>
              <th className="px-1.5 py-1.5 text-left">{t('status')}</th>
              <th className="px-1.5 py-1.5 text-left">{t('rpa-dpo')}</th>
              <th className="px-1.5 py-1.5 text-left">{t('rpa-review')}</th>
              <th className="px-1.5 py-1.5 text-left">
                {t('rpa-data-tranfer')}
              </th>
              <th className="px-1.5 py-1.5 text-left">{t('rpa-category')}</th>
              {canAccess('task', ['update']) && (
                <th className="px-1.5 py-1.5 text-left">{t('actions')}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((task) => (
              <tr key={task.id}>
                <td className="px-1.5 py-1.5">
                  <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                    <span className="underline">{task.title}</span>
                  </Link>
                </td>
                <td className="px-1.5 py-1.5">
                  <StatusBadge
                    label={
                      statuses.find(({ value }) => value === task.status)
                        ?.label as string
                    }
                    value={task.status}
                  />
                </td>
                <td className="px-1.5 py-1.5">
                  <span>{task.properties.rpa_procedure[0].dpo.label}</span>
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
                      ? 'Enabled'
                      : 'Disabled'}
                  </Badge>
                </td>
                <td className="px-1.5 py-1.5">
                  <div className="flex flex-col gap-1">
                    {task.properties.rpa_procedure[1].specialcategory.map(
                      (cat, i) => (
                        <Badge key={i} variant="secondary">
                          {cat.label}
                        </Badge>
                      )
                    )}
                  </div>
                </td>
                {canAccess('task', ['update']) && (
                  <td className="px-1.5 py-1.5">
                    <div className="btn-group flex gap-2">
                      <DaisyButton
                        size="sm"
                        variant="outline"
                        onClick={() => editHandler(task)}
                      >
                        {t('edit-task')}
                      </DaisyButton>
                      <DaisyButton
                        size="sm"
                        variant="outline"
                        onClick={() => deleteHandler(task)}
                      >
                        {t('delete')}
                      </DaisyButton>
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
          onChange={(page) => {
            if (page > currentPage) goToNextPage();
            else if (page < currentPage) goToPreviousPage();
          }}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
        />
      )}
    </div>
  );
};

export default RpaTable;
