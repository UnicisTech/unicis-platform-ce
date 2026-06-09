import React from 'react';
import Link from 'next/link';
import type { TaskWithTiaProcedure } from 'types';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { isTranferPermitted } from '@/lib/tia/helpers';

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
  const { canAccess } = useCanAccess(slug);
  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<TaskWithTiaProcedure>(tasks, perPage);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden [&_th]:whitespace-normal! [&_td]:whitespace-normal!">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
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
          <tbody className="divide-y divide-slate-100">
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
                  <Badge variant="outline">
                    {task.properties.tia_procedure[0].StartDateAssessment}
                  </Badge>
                </td>
                <td className="px-1.5 py-1.5">
                  <Badge variant="outline">
                    {getEndDate(
                      task.properties.tia_procedure[0].StartDateAssessment,
                      task.properties.tia_procedure[0].AssessmentYears
                    )}
                  </Badge>
                </td>
                <td className="px-1.5 py-1.5">
                  <span>{task.properties.tia_procedure[0].DataExporter}</span>
                </td>
                <td className="px-1.5 py-1.5">
                  <span>
                    {/* TODO: reuse the component from Conclusion step*/}
                    {isTranferPermitted(task.properties.tia_procedure) ? (
                      <DaisyBadge color="success">
                        {t('tia-permitted-badge')}
                      </DaisyBadge>
                    ) : (
                      <DaisyBadge color="error">
                        {t('tia-not-permitted-badge')}
                      </DaisyBadge>
                    )}
                  </span>
                </td>
                {canAccess('task', ['update']) && (
                  <td className="px-1.5 py-1.5">
                    <div className="flex gap-2">
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
                        variant="destructive"
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

export default TiaTable;
