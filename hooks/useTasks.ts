import fetcher from '@/lib/fetcher';
import type { Task } from 'types';
import useSWR from 'swr';
import type { ApiResponse } from 'types';

const useTasks = (slug: string) => {
  const url = `/api/teams/${slug}/tasks`;

  const {
    data,
    error,
    mutate: mutateTasks,
  } = useSWR<ApiResponse<Task[]>>(url, fetcher);

  return {
    isLoading: !error && !data,
    isError: error,
    tasks: data?.data,
    mutateTasks,
  };
};

export default useTasks;
