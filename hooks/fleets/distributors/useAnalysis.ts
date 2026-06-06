import fleetFetcher from '@/lib/fleet/fleetFetcher';
import { TaskAnalysis, TaskResultAnalysis } from '@/types/fleet';
import useSWR, { mutate } from 'swr';

export const useDistributorAnalysis = (teamId: string) => {
  const url = `/manager/${teamId}/analysis/tasks`;
  const { data, error, isLoading } = useSWR<TaskAnalysis>(url, fleetFetcher, {
    shouldRetryOnError: false,
    onError: (err) => {
      console.log(
        '[useDistributorAnalysis] No task analysis data available:',
        err.message
      );
    },
  });

  const mutateDistributorAnalysis = async () => {
    mutate(url);
  };

  return {
    distributorsAnalysis: data,
    isLoading,
    isError: error,
    mutateDistributorAnalysis,
  };
};

export const useDistributorResultAnalysis = (teamId: string) => {
  const url = `/manager/${teamId}/analysis/query`;
  const { data, error, isLoading } = useSWR<TaskResultAnalysis>(
    url,
    fleetFetcher,
    {
      shouldRetryOnError: false,
      onError: (err) => {
        console.log(
          '[useDistributorResultAnalysis] No query result analysis data available:',
          err.message
        );
      },
    }
  );

  const mutateDistributorResultAnalysis = async () => {
    mutate(url);
  };

  return {
    distributorsResultAnalysis: data,
    isLoading,
    isError: error,
    mutateDistributorResultAnalysis,
  };
};
