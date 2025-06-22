import React from 'react';
import Link from 'next/link';
import statuses from '@/components/defaultLanding/data/statuses.json';
import type { TaskWithPiaRisk } from 'types';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import { StatusBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import {
  riskProbabilityPoints,
  riskSecurityPoints,
} from '@/components/defaultLanding/data/configs/pia';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';

const calculatePercentage = (input: number): number => {
  return (input / 16) * 100;
};

const riskValueToLabel = (value: number): string => {
  const riskLevels = [
    { max: 20, label: 'Insignificant' },
    { max: 40, label: 'Minor' },
    { max: 60, label: 'Moderate' },
    { max: 80, label: 'Major' },
    { max: 100, label: 'Extreme' },
  ];

  for (const { max, label: riskLabel } of riskLevels) {
    if (value <= max) {
      return riskLabel;
    }
  }

  return '';
};

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
  tasks: Array<TaskWithPiaRisk>;
  perPage: number;
  editHandler: (task: TaskWithPiaRisk) => void;
  deleteHandler: (task: TaskWithPiaRisk) => void;
}) => {
  const { canAccess } = useCanAccess();
  const { t } = useTranslation('common');
  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<TaskWithPiaRisk>(tasks, perPage);

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
                Confidentiality and Integrity
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                Availability
              </th>
              <th scope="col" className="px-1.5 py-1.5 text-left">
                Transparency and data minimization
              </th>
              {canAccess('task', ['update']) && (
                <th scope="col" className="px-1.5 py-1.5 text-left">
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((task) => {
              const confidentialityValue = calculatePercentage(
                riskProbabilityPoints[
                  task.properties.pia_risk[1].confidentialityRiskProbability
                ] *
                  riskSecurityPoints[
                    task.properties.pia_risk[1].confidentialityRiskSecurity
                  ]
              );
              const availabilityValue = calculatePercentage(
                riskProbabilityPoints[
                  task.properties.pia_risk[2].availabilityRiskProbability
                ] *
                  riskSecurityPoints[
                    task.properties.pia_risk[2].availabilityRiskSecurity
                  ]
              );
              const transparencyValue = calculatePercentage(
                riskProbabilityPoints[
                  task.properties.pia_risk[3].transparencyRiskProbability
                ] *
                  riskSecurityPoints[
                    task.properties.pia_risk[3].transparencyRiskSecurity
                  ]
              );

              return (
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
                  <td
                    className={`px-1.5 py-1.5 ${getBgColorClass(confidentialityValue)}`}
                  >
                    {riskValueToLabel(confidentialityValue)}
                  </td>
                  <td
                    className={`px-1.5 py-1.5 ${getBgColorClass(availabilityValue)}`}
                  >
                    {riskValueToLabel(availabilityValue)}
                  </td>
                  <td
                    className={`px-1.5 py-1.5 ${getBgColorClass(transparencyValue)}`}
                  >
                    {riskValueToLabel(transparencyValue)}
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

export default RisksTable;
