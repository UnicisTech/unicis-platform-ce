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

  const { t } = useTranslation('common');

  useEffect(() => {
    return () => {
      mutateDistributorAnalysis();
      mutateDistributorResultAnalysis();
    };
  }, []);

  // For auditors, use auditor stats endpoint data
  if (isAuditor && auditorStats) {
    const boxes = [
      { label: t('new-query-task'), value: auditorStats.new_tasks },
      { label: t('pending-query-task'), value: auditorStats.pending_tasks },
      { label: t('completed-query-task'), value: auditorStats.completed_tasks },
      { label: t('failed-query-task'), value: auditorStats.failed_tasks },
      { label: t('total-query-task'), value: auditorStats.total_tasks },
      {
        label: t('total-query-result'),
        value: auditorStats.total_query_results,
      },
    ];

    return (
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {t('Asset Task Analysis')}
        </h2>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {boxes.map((b) => (
            <div
              key={b.label}
              className="
                flex flex-col justify-between text-center
                rounded-md border border-border
                bg-secondary/40 backdrop-blur-sm
                hover:bg-secondary/60 transition-colors
              "
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground bg-secondary/70 py-1 rounded-t-md">
                {b.label}
              </div>
              <span className="text-lg font-semibold text-foreground py-2">
                {b.value ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (analysisError && isError) {
    return null;
  }

  const boxes = [
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
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {t('Asset Task Analysis')}
      </h2>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="
              flex flex-col justify-between text-center 
              rounded-md border border-border 
              bg-secondary/40 backdrop-blur-sm
              hover:bg-secondary/60 transition-colors
            "
          >
            <div className="text-xs uppercase tracking-wide text-muted-foreground bg-secondary/70 py-1 rounded-t-md">
              {b.label}
            </div>
            <span className="text-lg font-semibold text-foreground py-2">
              {b.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetTaskAnalysis;
