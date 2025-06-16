import React from 'react';
import Link from 'next/link';
import statuses from '@/components/defaultLanding/data/statuses.json';
import type { TaskWithRpaProcedure } from 'types';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import { StatusBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';

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
    nextButtonDisabled
  } = usePagination<TaskWithRpaProcedure>(tasks, perPage);

  return (
    <div className="[&_th]:!whitespace-normal [&_td]:!whitespace-normal">
      <div className="overflow-x-auto">
        <table className="text-sm table w-full border-b dark:border-base-200">
          <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
            {/* <table className="w-full table-fixed text-left text-sm border-b dark:border-base-200 dark:text-gray-400">
            <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400"> */}
            <tr>
              <th scope="col" className="px-1.5 py-1.5">
                {t('rpa')}
              </th>
              <th scope="col" className="px-1.5 py-1.5">
                {t('status')}
              </th>
              <th scope="col" className="px-1.5 py-1.5">
                {t('rpa-dpo')}
              </th>
              <th scope="col" className="px-1.5 py-1.5">
                {t('rpa-review')}
              </th>
              <th scope="col" className="px-1.5 py-1.5">
                {t('rpa-data-tranfer')}
              </th>
              <th scope="col" className="px-1.5 py-1.5">
                {t('rpa-category')}
              </th>
              {canAccess('task', ['update']) && (
                <th scope="col" className="px-1.5 py-1.5">
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((task, index) => (
              <tr
                key={index}
                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <td className="px-1.5 py-1.5">
                  <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                    <div className="flex items-center justify-start space-x-2">
                      <span className="underline">{task.title}</span>
                    </div>
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
                  <DaisyBadge color='tag'>{task.properties.rpa_procedure[0].reviewDate}</DaisyBadge>
                </td>
                <td className="px-1.5 py-1.5">
                  <>
                    {task.properties.rpa_procedure[3].datatransfer ? (
                      <DaisyBadge color="success">Enabled</DaisyBadge>
                    ) : (
                      <DaisyBadge color="error">Disabled</DaisyBadge>
                    )}
                  </>
                </td>
                <td className="px-1.5 py-1.5">
                  <div className="flex flex-col">
                    {task.properties.rpa_procedure[1].specialcategory.map(
                      (category, index) => (
                        <DaisyBadge key={index} color='tag'>{category.label}</DaisyBadge>
                      )
                    )}
                  </div>
                </td>
                {canAccess('task', ['update']) && (
                  <td className="px-1.5 py-1.5">
                    <div className="btn-group">
                      <DaisyButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          editHandler(task);
                        }}
                      >
                        {t('edit-task')}
                      </DaisyButton>

                      <DaisyButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          deleteHandler(task);
                        }}
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
