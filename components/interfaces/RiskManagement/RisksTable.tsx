import React from 'react';
import Link from 'next/link';
import type { TaskWithRmRisk } from 'types';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import {
  calculateCurrentRiskRating,
  calculateRiskRating,
  getInitials,
  riskValueToLabel,
} from '@/lib/rm';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';

const verticalTextStyles =
  'px-1.5 py-1.5 whitespace-nowrap align-middle text-center [writing-mode:vertical-rl] rotate-180';

const getBgColorClass = (riskLevel: number): string => {
  const riskLevels = [
    { max: 1, class: 'risk-extreme-low' },
    { max: 40, class: 'risk-low' },
    { max: 60, class: 'risk-medium' },
    { max: 80, class: 'risk-high' },
    { max: 100, class: 'risk-extreme' },
  ];

  for (const { max, class: riskClass } of riskLevels) {
    if (riskLevel <= max) {
      return 'bg-' + riskClass;
    }
  }

  return '';
};

const RisksTable = ({
  slug,
  tasks,
  perPage,
  editHandler,
  deleteHandler,
}: {
  slug: string;
  tasks: Array<TaskWithRmRisk>;
  perPage: number;
  editHandler: (task: TaskWithRmRisk) => void;
  deleteHandler: (task: TaskWithRmRisk) => void;
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
  } = usePagination<TaskWithRmRisk>(tasks, perPage);

  return (
    <div className="[&_th]:whitespace-normal! [&_td]:whitespace-normal!">
      <div className="overflow-x-auto">
        <table className="text-sm table w-full border-b dark:border-base-200">
          <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className={verticalTextStyles}>Risk ID</th>
              <th className={verticalTextStyles}>Risk</th>
              <th className={verticalTextStyles}>Asset Owner</th>
              <th className={verticalTextStyles}>Impact</th>
              <th className={verticalTextStyles}>Raw probability</th>
              <th className={verticalTextStyles}>Raw impact</th>
              <th className={verticalTextStyles}>Raw risk rating</th>
              <th className={verticalTextStyles}>Treatment</th>
              <th className={verticalTextStyles}>Treatment cost</th>
              <th className={verticalTextStyles}>Treatment status</th>
              <th className={verticalTextStyles}>Treated probability</th>
              <th className={verticalTextStyles}>Treated impact</th>
              <th className={verticalTextStyles}>Target risk rating</th>
              <th className={verticalTextStyles}>Current risk rating</th>
              {canAccess('task', ['update']) && (
                <th scope="col" className={verticalTextStyles}>
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((task, index) => {
              const risk = task.properties.rm_risk;
              const rawRiskRating = calculateRiskRating(
                risk[0].RawProbability,
                risk[0].RawImpact
              );
              const targetRiskRating = calculateRiskRating(
                risk[1].TreatedProbability,
                risk[1].TreatedImpact
              );
              const currentRiskRating = calculateCurrentRiskRating(
                rawRiskRating,
                targetRiskRating,
                risk[1].TreatmentStatus
              );

              return (
                <tr
                  key={index}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td>
                    <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                      <div className="flex items-center justify-start space-x-2">
                        <span className="underline">{task.title}</span>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span>{risk[0].Risk}</span>
                  </td>
                  <td>
                    <span>{getInitials(risk[0].AssetOwner.label)}</span>
                  </td>
                  <td>
                    <span>{risk[0].Impact}</span>
                  </td>
                  <td>
                    <span>{riskValueToLabel(risk[0].RawProbability)}</span>
                  </td>
                  <td>
                    <span>{riskValueToLabel(risk[0].RawImpact)}</span>
                  </td>
                  <td
                    className={`dark:text-black ${getBgColorClass(rawRiskRating)}`}
                  >
                    {riskValueToLabel(rawRiskRating)}
                  </td>
                  <td>{risk[1].RiskTreatment}</td>
                  <td>{risk[1].TreatmentCost}</td>
                  <td>{riskValueToLabel(risk[1].TreatmentStatus)}</td>
                  <td>{riskValueToLabel(risk[1].TreatedProbability)}</td>
                  <td>{riskValueToLabel(risk[1].TreatedImpact)}</td>
                  <td
                    className={`dark:text-black ${getBgColorClass(targetRiskRating)}`}
                  >
                    {riskValueToLabel(targetRiskRating)}
                  </td>
                  <td
                    className={`dark:text-black ${getBgColorClass(currentRiskRating)}`}
                  >
                    {riskValueToLabel(currentRiskRating)}
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
              );
            })}
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
  )
};

export default RisksTable;
