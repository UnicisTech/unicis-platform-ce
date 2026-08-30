import {
  useDistributorAnalysis,
  useDistributorResultAnalysis,
} from '@/hooks/fleets/distributors/useAnalysis';
import { useAuditorStats } from '@/hooks/fleets/distributors/useAuditorStats';
import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardHeader,
} from '@/components/shared';

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
    <ManagementCard>
      <ManagementCardHeader title={t('fleet:fleet-asset-task-analysis')} />
      <ManagementCardContent className="grid grid-cols-3 gap-1.5 p-2.5 sm:grid-cols-6">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="rounded-lg border border-slate-200 dark:border-slate-700 text-center overflow-hidden"
          >
            <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 py-0.5">
              {b.label}
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 py-1">
              {b.value ?? 0}
            </div>
          </div>
        ))}
      </ManagementCardContent>
    </ManagementCard>
  );
};

export default AssetTaskAnalysis;
