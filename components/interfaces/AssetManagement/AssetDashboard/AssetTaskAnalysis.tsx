import { useDistributorAnalysis, useDistributorResultAnalysis } from "@/hooks/fleets/distributors/useAnalysis";
import { useEffect } from "react";

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

  useEffect(() => {
    return () => {
      mutateDistributorAnalysis();
      mutateDistributorResultAnalysis();
    };
  }, []);

  const boxes = [
    { label: "NEW QUERY TASK", value: distributorsAnalysis?.new_queries_task },
    { label: "PENDING QUERY TASK", value: distributorsAnalysis?.pending_queries_task },
    { label: "COMPLETED QUERY TASK", value: distributorsAnalysis?.completed_queries_task },
    { label: "FAILED QUERY TASK", value: distributorsAnalysis?.failed_queries_task },
    { label: "TOTAL QUERY TASK", value: distributorsAnalysis?.total_queries_task },
    { label: "TOTAL QUERY RESULT", value: distributorsResultAnalysis?.total_queries_result },
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
