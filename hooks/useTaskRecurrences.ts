import fetcher from '@/lib/fetcher';
import type { ApiResponse, TaskRecurrence } from 'types';
import useSWR from 'swr';

const useTaskRecurrences = (slug?: string) => {
  const url = slug ? `/api/teams/${slug}/task-recurrences` : null;

  const {
    data,
    error,
    mutate: mutateTaskRecurrences,
  } = useSWR<ApiResponse<TaskRecurrence[]>>(url, fetcher);

  return {
    isLoading: Boolean(url) && !error && !data,
    isError: error,
    taskRecurrences: data?.data,
    mutateTaskRecurrences,
  };
};

export default useTaskRecurrences;
