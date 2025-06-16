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
    <div className="[&_th]:whitespace-normal! [&_td]:whitespace-normal!">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('rpa')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('status')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('rpa-dpo')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('rpa-review')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('rpa-data-tranfer')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('rpa-category')}
              </th>
              {canAccess('task', ['update']) && (
                <th scope="col" className="px-1.5 py-1.5 text-left">
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((task, index) => (
              <tr key={task.id}>
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
    </div>
  );
};

export default RpaTable;
