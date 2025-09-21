import fetcher from '@/lib/fetcher';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, ISO } from 'types';

const useCscStatuses = (slug: string, framework: ISO) => {
  const url = `/api/teams/${slug}/csc/${framework}`;

  const { data, error } = useSWR<ApiResponse<any>>(url, fetcher);

  const mutateStatuses = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    statuses: data?.data?.statuses || {},
    mutateStatuses,
  };
};

export default useCscStatuses;
