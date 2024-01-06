import React from 'react';
import Link from 'next/link';
import { SimpleTag as Tag } from '@atlaskit/tag';
import statuses from '@/components/defaultLanding/data/statuses.json';
import type { TaskWithRpaProcedure } from 'types';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import { TailwindTableWrapper } from 'sharedStyles';
import { StatusBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import Badge from '@/components/shared/Badge';

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

  return (
    <>
      <TailwindTableWrapper>
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
                    <Tag text={task.properties.rpa_procedure[0].reviewDate} />
                  </td>
                  <td className="px-1.5 py-1.5">
                    <>
                      {task.properties.rpa_procedure[3].datatransfer ? (
                        <Badge color="success">Enabled</Badge>
                      ) : (
                        <Badge color="error">Disabled</Badge>
                      )}
                    </>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <div className="flex flex-col">
                      {task.properties.rpa_procedure[1].specialcategory.map(
                        (category, index) => (
                          <Tag key={index} text={category.label} />
                        )
                      )}
                    </div>
                  </td>
                  {canAccess('task', ['update']) && (
                    <td className="px-1.5 py-1.5">
                      <div className="btn-group">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            editHandler(task);
                          }}
                        >
                          {t('edit-task')}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            deleteHandler(task);
                          }}
                        >
                          {t('delete')}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      </TailwindTableWrapper>
    </>
  );
};

export default RpaTable;
