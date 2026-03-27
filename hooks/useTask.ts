import fetcher from '@/lib/fetcher';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, TaskExtendedDto } from 'types';

const useTask = (slug: string, taskNumber: string) => {
  const url = `/api/teams/${slug}/tasks/${taskNumber}`;
  const resp = useSWR<ApiResponse<TaskExtendedDto>>(url, fetcher);

  const { data, error } = resp;

  const mutateTask = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    task: data?.data,
    mutateTask,
  };
};

export default useTask;
