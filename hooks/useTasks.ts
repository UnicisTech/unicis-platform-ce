import fetcher from '@/lib/fetcher';
import { Task } from '@prisma/client';
import useSWR, { mutate } from 'swr';
import type { ApiResponse } from 'types';

const useTasks = (slug: string) => {
  const url = `/api/teams/${slug}/tasks`;

  const { data, error } = useSWR<ApiResponse<Task[]>>(url, fetcher);

  const mutateTasks = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    tasks: data?.data,
    mutateTasks,
  };
};

export default useTasks;
