import fetcher from '@/lib/fetcher';
import type { Task } from 'types';
import useSWR, { mutate } from 'swr';
import type { ApiResponse } from 'types';

const useTeamTasks = (slug: string) => {
  const url = `/api/teams/${slug}/tasks`;

  const { data, error } = useSWR<ApiResponse<Task[]>>(url, fetcher);

  const mutateTasks = async () => {
    await mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    tasks: data?.data,
    mutateTasks,
  };
};

export default useTeamTasks;
