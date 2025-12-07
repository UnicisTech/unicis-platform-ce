import { useDistributorAnalysis, useDistributorResultAnalysis } from "@/hooks/fleets/distributors/useAnalysis";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const AssetTaskAnalysis = ({ teamId }: { teamId: string }) => {
  const {
    distributorsAnalysis,
    isLoading: analysisLoading,
    isError: analysisError,
    mutateDistributorAnalysis,
  } = useDistributorAnalysis(teamId);
  const {
    distributorsResultAnalysis,
    isLoading,
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

  const boxes = [
    { label: t('new-query-task'), value: distributorsAnalysis?.new_queries_task },
    { label: t('pending-query-task'), value: distributorsAnalysis?.pending_queries_task },
    { label: t('completed-query-task'), value: distributorsAnalysis?.completed_queries_task },
    { label: t('failed-query-task'), value: distributorsAnalysis?.failed_queries_task },
    { label: t('total-query-task'), value: distributorsAnalysis?.total_queries_task },
    { label: t('total-query-result'), value: distributorsResultAnalysis?.total_queries_result },
  ];  

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Asset Task Analysis
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
