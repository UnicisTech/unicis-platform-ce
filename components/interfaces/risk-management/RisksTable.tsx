import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import useCanAccess from 'hooks/useCanAccess';
import {
  calculateCurrentRiskRating,
  calculateRiskRating,
} from '@/lib/rm/helpers';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import type { TaskWithRmRisk } from 'types';
import useTheme from 'hooks/useTheme';
import { Button } from '@/components/shadcn/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import useTeamMembersMap from 'hooks/useTeamMembersMap';
import { Error, Loading } from '@/components/shared';
import { riskValueToLabelKey } from '@/lib/common';

// ── Static risk-color lookup (avoids dynamic class-name JIT issues) ───────────
const RISK_COLOR_LIGHT: Record<string, string> = {
  'risk-extreme-low': 'bg-risk-extreme-low text-slate-700',
  'risk-low':         'bg-risk-low text-slate-700',
  'risk-medium':      'bg-risk-medium text-slate-700',
  'risk-high':        'bg-risk-high text-white',
  'risk-extreme':     'bg-risk-extreme text-white',
};
const RISK_COLOR_DARK: Record<string, string> = {
  'risk-extreme-low': 'bg-risk-extreme-low-dark text-slate-100',
  'risk-low':         'bg-risk-low-dark text-slate-100',
  'risk-medium':      'bg-risk-medium-dark text-slate-100',
  'risk-high':        'bg-risk-high-dark text-white',
  'risk-extreme':     'bg-risk-extreme-dark text-white',
};

function getRiskClass(value: number, dark: boolean): string {
  let key: string;
  if (value <= 1)  key = 'risk-extreme-low';
  else if (value <= 40) key = 'risk-low';
  else if (value <= 60) key = 'risk-medium';
  else if (value <= 80) key = 'risk-high';
  else key = 'risk-extreme';
  return dark ? (RISK_COLOR_DARK[key] ?? '') : (RISK_COLOR_LIGHT[key] ?? '');
}

// ── Shared th style ───────────────────────────────────────────────────────────
const TH = 'px-2 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap';

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
  const { canAccess } = useCanAccess(slug);
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(tasks, perPage);

  const { isLoading, isError, membersById } = useTeamMembersMap(slug);

  if (isLoading) return <Loading />;
  if (isError)   return <Error message={isError?.message} />;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-[12px]">
          <thead className="bg-slate-50 dark:bg-slate-900">
            {/* Row 1: section group labels */}
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th colSpan={4} className={TH}>{/* Task + risk metadata */}</th>
              <th colSpan={3} className={`${TH} border-l border-slate-200 dark:border-slate-700 text-center`}>
                {t('rm:headers.raw-risk-rating')}
              </th>
              <th colSpan={3} className={`${TH} border-l border-slate-200 dark:border-slate-700 text-center`}>
                {t('rm:headers.treatment')}
              </th>
              <th colSpan={3} className={`${TH} border-l border-slate-200 dark:border-slate-700 text-center`}>
                {t('rm:headers.target-risk-rating')}
              </th>
              <th className={`${TH} border-l border-slate-200 dark:border-slate-700 text-center`}>
                {t('rm:headers.current-risk-rating')}
              </th>
              {canAccess('task', ['update']) && <th className={TH} />}
            </tr>
            {/* Row 2: column-level labels */}
            <tr>
              <th className={TH}>{t('title')}</th>
              <th className={TH}>{t('rm:fields.Risk')}</th>
              <th className={TH}>{t('rm:fields.AssetOwner')}</th>
              <th className={TH}>{t('rm:fields.Impact')}</th>
              <th className={`${TH} border-l border-slate-200 dark:border-slate-700`}>{t('rm:fields.RawProbability')}</th>
              <th className={TH}>{t('rm:fields.RawImpact')}</th>
              <th className={TH}>{t('rm:headers.raw-risk-rating')}</th>
              <th className={`${TH} border-l border-slate-200 dark:border-slate-700`}>{t('rm:fields.RiskTreatment')}</th>
              <th className={TH}>{t('rm:fields.TreatmentCost')}</th>
              <th className={TH}>{t('rm:fields.TreatmentStatus')}</th>
              <th className={`${TH} border-l border-slate-200 dark:border-slate-700`}>{t('rm:fields.TreatedProbability')}</th>
              <th className={TH}>{t('rm:fields.TreatedImpact')}</th>
              <th className={TH}>{t('rm:headers.target-risk-rating')}</th>
              <th className={`${TH} border-l border-slate-200 dark:border-slate-700`}>{t('rm:headers.current-risk-rating')}</th>
              {canAccess('task', ['update']) && (
                <th className={TH}>{t('actions')}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {pageData.map((task) => {
              const risk = task.properties.rm_risk;
              const raw     = calculateRiskRating(risk[0].RawProbability,     risk[0].RawImpact);
              const target  = calculateRiskRating(risk[1].TreatedProbability, risk[1].TreatedImpact);
              const current = calculateCurrentRiskRating(raw, target, risk[1].TreatmentStatus);
              const owner   = membersById.get(risk[0].AssetOwner) ?? t('not-found');

              return (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-2 py-2 max-w-[160px]">
                    <Link
                      href={`/teams/${slug}/tasks/${task.taskNumber}`}
                      className="text-ub-blue hover:underline font-medium truncate block"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-2 py-2 max-w-[160px]">
                    <span className="block truncate text-slate-700 dark:text-slate-200" title={risk[0].Risk}>
                      {risk[0].Risk}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {owner}
                  </td>
                  <td className="px-2 py-2 max-w-[140px]">
                    <span className="block truncate text-slate-600 dark:text-slate-300" title={risk[0].Impact}>
                      {risk[0].Impact}
                    </span>
                  </td>

                  {/* Raw risk section */}
                  <td className="px-2 py-2 border-l border-slate-100 dark:border-slate-700 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {t(riskValueToLabelKey(risk[0].RawProbability))}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {t(riskValueToLabelKey(risk[0].RawImpact))}
                  </td>
                  <td className={`px-2 py-2 whitespace-nowrap font-medium ${getRiskClass(raw, isDark)}`}>
                    {t(riskValueToLabelKey(raw))}
                  </td>

                  {/* Treatment section */}
                  <td className="px-2 py-2 border-l border-slate-100 dark:border-slate-700 max-w-[160px]">
                    <span className="block truncate text-slate-600 dark:text-slate-300" title={risk[1].RiskTreatment}>
                      {risk[1].RiskTreatment}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {risk[1].TreatmentCost}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {t(riskValueToLabelKey(risk[1].TreatmentStatus))}
                  </td>

                  {/* Target risk section */}
                  <td className="px-2 py-2 border-l border-slate-100 dark:border-slate-700 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {t(riskValueToLabelKey(risk[1].TreatedProbability))}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {t(riskValueToLabelKey(risk[1].TreatedImpact))}
                  </td>
                  <td className={`px-2 py-2 whitespace-nowrap font-medium ${getRiskClass(target, isDark)}`}>
                    {t(riskValueToLabelKey(target))}
                  </td>

                  {/* Current risk */}
                  <td className={`px-2 py-2 border-l border-slate-100 dark:border-slate-700 whitespace-nowrap font-medium ${getRiskClass(current, isDark)}`}>
                    {t(riskValueToLabelKey(current))}
                  </td>

                  {canAccess('task', ['update']) && (
                    <td className="px-2 py-2">
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
