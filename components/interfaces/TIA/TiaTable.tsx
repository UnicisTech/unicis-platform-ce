import React from 'react';
import Link from 'next/link';
import type { TaskWithTiaProcedure } from 'types';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';

const getEndDate = (dateStr, yearsToAdd) => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + yearsToAdd);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const TiaTable = ({
  slug,
  tasks,
  perPage,
  editHandler,
  deleteHandler,
}: {
  slug: string;
  tasks: Array<TaskWithTiaProcedure>;
  perPage: number;
  editHandler: (task: TaskWithTiaProcedure) => void;
  deleteHandler: (task: TaskWithTiaProcedure) => void;
}) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<TaskWithTiaProcedure>(tasks, perPage);

  return (
    <div className="[&_th]:whitespace-normal! [&_td]:whitespace-normal!">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('tia')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('tia-data-exporter')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('tia-data-importer')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('tia-assessment-date')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('tia-ending-date')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('tia-egal-analysis')}
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                {t('tia-transfer-is')}
              </th>
              {canAccess('task', ['update']) && (
                <th scope="col" className="px-1.5 py-1.5 text-left">
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((task) => (
              <tr key={task.id}>
                <td className="px-1.5 py-1.5">
                  <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                    <div className="flex items-center justify-start space-x-2">
                      <span className="underline">{task.title}</span>
                    </div>
                  </Link>
                </td>
                <td className="px-1.5 py-1.5">
                  <span>{task.properties.tia_procedure[0].DataExporter}</span>
                </td>
                <td className="px-1.5 py-1.5">
                  <span>{task.properties.tia_procedure[0].DataImporter}</span>
                </td>
                <td className="px-1.5 py-1.5">
                  <DaisyBadge color="tag">
                    {task.properties.tia_procedure[0].StartDateAssessment}
                  </DaisyBadge>
                </td>
                <td className="px-1.5 py-1.5">
                  <DaisyBadge color="tag">
                    {getEndDate(
                      task.properties.tia_procedure[0].StartDateAssessment,
                      task.properties.tia_procedure[0].AssessmentYears
                    )}
                  </DaisyBadge>
                </td>
                <td className="px-1.5 py-1.5">
                  <span>{task.properties.tia_procedure[0].DataExporter}</span>
                </td>
                <td className="px-1.5 py-1.5">
                  <span>
                    {task.properties.tia_procedure[0].LawImporterCountry.label}
                  </span>
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

export default TiaTable;
