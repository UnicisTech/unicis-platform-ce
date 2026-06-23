import {
  useDistributorAnalysis,
  useDistributorResultAnalysis,
} from '@/hooks/fleets/distributors/useAnalysis';
import { useAuditorStats } from '@/hooks/fleets/distributors/useAuditorStats';
import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';

const AssetTaskAnalysis = ({
  teamId,
  isAuditor,
}: {
  teamId: string;
  isAuditor?: boolean;
}) => {
  const { auditorStats } = useAuditorStats(teamId);
  const {
    distributorsAnalysis,
    isError: analysisError,
    mutateDistributorAnalysis,
  } = useDistributorAnalysis(teamId);
  const {
    distributorsResultAnalysis,
    isError,
    mutateDistributorResultAnalysis,
  } = useDistributorResultAnalysis(teamId);

  const { t } = useTranslation(['common', 'fleet']);

  useEffect(() => {
    return () => {
      mutateDistributorAnalysis();
      mutateDistributorResultAnalysis();
    };
  }, []);

  if (!isAuditor && analysisError && isError) {
    return null;
  }

  const useAuditorData = isAuditor && auditorStats;
  const boxes = useAuditorData
    ? [
        { label: t('new-query-task'), value: auditorStats.new_tasks },
        { label: t('pending-query-task'), value: auditorStats.pending_tasks },
        {
          label: t('completed-query-task'),
          value: auditorStats.completed_tasks,
        },
        { label: t('failed-query-task'), value: auditorStats.failed_tasks },
        { label: t('total-query-task'), value: auditorStats.total_tasks },
        {
          label: t('total-query-result'),
          value: auditorStats.total_query_results,
        },
      ]
    : [
        {
          label: t('new-query-task'),
          value: distributorsAnalysis?.new_queries_task,
        },
        {
          label: t('pending-query-task'),
          value: distributorsAnalysis?.pending_queries_task,
        },
        {
          label: t('completed-query-task'),
          value: distributorsAnalysis?.completed_queries_task,
        },
        {
          label: t('failed-query-task'),
          value: distributorsAnalysis?.failed_queries_task,
        },
        {
          label: t('total-query-task'),
          value: distributorsAnalysis?.total_queries_task,
        },
        {
          label: t('total-query-result'),
          value: distributorsResultAnalysis?.total_queries_result,
        },
      ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {t('fleet:fleet-asset-task-analysis')}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="rounded-lg border border-slate-200 dark:border-slate-700 text-center overflow-hidden"
          >
            <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 py-1">
              {b.label}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 py-2">
              {b.value ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetTaskAnalysis;
