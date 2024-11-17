import { useDistributorAnalysis, useDistributorResultAnalysis} from "@/hooks/fleets/distributors/useAnalysis";
import { useEffect } from "react";

const AssetTaskAnalysis = ({teamId}: { teamId: string }) => {
    
    const { distributorsAnalysis, isLoading: analysisLoading, isError: analysisError, mutateDistributorAnalysis } = useDistributorAnalysis(teamId);
    const { distributorsResultAnalysis, isLoading, isError, mutateDistributorResultAnalysis } = useDistributorResultAnalysis(teamId);

    useEffect(() => {
      return () => {
          mutateDistributorAnalysis();
          mutateDistributorResultAnalysis();
      }
    }, [])
    
    return (
        <div>
            {JSON.stringify(distributorsAnalysis)}
            <h2 className="text-xl font-medium leading-none tracking-tight">
                Asset Task Analysis
            </h2>
            <div className="grid grid-cols-3 gap-x-4 mt-4">
                <div className="p-1 ring-1 ring-gray-300 text-center rounded-sm justify-between">
                    <div className="text-xs">NEW QUERY TASK</div>
                    <span>{distributorsAnalysis?.new_queries_task || 0}</span>
                </div>
                <div className="p-1 ring-1 ring-gray-300 text-center rounded-sm justify-between">
                    <div className="text-xs">PENDING QUERY TASK</div>
                    <span>{distributorsAnalysis?.pending_queries_task || 0}</span>
                </div>
                <div className="p-1 ring-1 ring-gray-300 text-center rounded-sm justify-between">
                    <div className="text-xs">COMPLETED QUERY TASK</div>
                    <span>{distributorsAnalysis?.completed_queries_task || 0}</span>
                </div>
                <div className="p-1 ring-1 ring-gray-300 text-center rounded-sm justify-between">
                    <div className="text-xs">FAILED QUERY TASK</div>
                    <span>{distributorsAnalysis?.failed_queries_task || 0}</span>
                </div>
                <div className="p-1 ring-1 ring-gray-300 text-center rounded-sm justify-between">
                    <div className="text-xs">TOTAL QUERY TASK</div>
                    <span>{distributorsAnalysis?.total_queries_task || 0}</span>
                </div>
                <div className="p-1 ring-1 ring-gray-300 text-center rounded-sm justify-between">
                    <div className="text-xs">TOTAL QUERY RESULT</div>
                    <span>{distributorsResultAnalysis?.total_queries_result || 0}</span>
                </div>
            </div>
        </div>
    )
}

export default AssetTaskAnalysis