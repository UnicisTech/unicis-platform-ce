import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import { calculateCurrentRiskRating, calculateRiskRating, getInitials, riskValueToLabel } from '@/lib/rm';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import type { TaskWithRmRisk } from 'types';

const getRiskColor = (value: number): string => {
  if (value <= 1) return 'bg-risk-extreme-low';
  if (value <= 40) return 'bg-risk-low';
  if (value <= 60) return 'bg-risk-medium';
  if (value <= 80) return 'bg-risk-high';
  return 'bg-risk-extreme';
};

const RisksTable = ({
  slug,
  tasks,
  perPage,
  editHandler,
  deleteHandler,
}: {
  slug: string;
  tasks: TaskWithRmRisk[];
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
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(tasks, perPage);

  const verticalHeader = (label: string) =>
    <div className="px-2 py-1 text-center whitespace-nowrap rotate-180 [writing-mode:vertical-rl]">{label}</div>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th>{t('risk-id')}</th>
              {[
                'Risk', 'Asset Owner', 'Impact',
                'Raw probability', 'Raw impact', 'Raw risk rating',
                'Treatment', 'Treatment cost', 'Treatment status',
                'Treated probability', 'Treated impact', 'Target risk rating',
                'Current risk rating',
              ].map((label) => (
                <th key={label}>{verticalHeader(label)}</th>
              ))}
              {canAccess('task', ['update']) && <th>{verticalHeader(t('actions'))}</th>}
            </tr>
          </thead>
          <tbody>
            {pageData.map((task, idx) => {
              const risk = task.properties.rm_risk;
              const raw = calculateRiskRating(risk[0].RawProbability, risk[0].RawImpact);
              const target = calculateRiskRating(risk[1].TreatedProbability, risk[1].TreatedImpact);
              const current = calculateCurrentRiskRating(raw, target, risk[1].TreatmentStatus);

              return (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1">
                    <Link href={`/teams/${slug}/tasks/${task.taskNumber}`} className="underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-2 py-1">{risk[0].Risk}</td>
                  <td className="px-2 py-1">{getInitials(risk[0].AssetOwner.label)}</td>
                  <td className="px-2 py-1">{risk[0].Impact}</td>
                  <td className="px-2 py-1">{riskValueToLabel(risk[0].RawProbability)}</td>
                  <td className="px-2 py-1">{riskValueToLabel(risk[0].RawImpact)}</td>
                  <td className={`px-2 py-1 ${getRiskColor(raw)}`}>{riskValueToLabel(raw)}</td>
                  <td className="px-2 py-1">{risk[1].RiskTreatment}</td>
                  <td className="px-2 py-1">{risk[1].TreatmentCost}</td>
                  <td className="px-2 py-1">{riskValueToLabel(risk[1].TreatmentStatus)}</td>
                  <td className="px-2 py-1">{riskValueToLabel(risk[1].TreatedProbability)}</td>
                  <td className="px-2 py-1">{riskValueToLabel(risk[1].TreatedImpact)}</td>
                  <td className={`px-2 py-1 ${getRiskColor(target)}`}>{riskValueToLabel(target)}</td>
                  <td className={`px-2 py-1 ${getRiskColor(current)}`}>{riskValueToLabel(current)}</td>
                  {canAccess('task', ['update']) && (
                    <td className="px-2 py-1">
                      <div className="flex gap-1">
                        <DaisyButton size="sm" variant="outline" onClick={() => editHandler(task)}>
                          {t('edit-task')}
                        </DaisyButton>
                        <DaisyButton size="sm" variant="outline" onClick={() => deleteHandler(task)}>
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
