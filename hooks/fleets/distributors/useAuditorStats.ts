import fleetFetcher from "@/lib/fleet/fleetFetcher";
import useSWR from "swr";

export interface AuditorStats {
  total_nodes: number;
  active_nodes: number;
  inactive_nodes: number;
  platform_counts: { [key: string]: number };
  total_tasks: number;
  new_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  total_query_results: number;
}

export const useAuditorStats = (teamId: string) => {
  const url = `/manager/${teamId}/analysis/auditor-stats`;
  const { data, error, isLoading } = useSWR<AuditorStats>(
    url,
    fleetFetcher,
    {
      shouldRetryOnError: false,
      onError: (err) => {
        console.log('[useAuditorStats] Error fetching auditor stats:', err.message);
      }
    }
  );

  return {
    auditorStats: data,
    isLoading,
    isError: error,
  };
};
