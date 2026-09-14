import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import type { ApiResponse, CommentsPageDto } from 'types';

const useComments = (slug: string, taskNumber: string) => {
  const url =
    slug && taskNumber
      ? `/api/teams/${slug}/tasks/${taskNumber}/comments`
      : null;
  const response = useSWR<ApiResponse<CommentsPageDto>>(url, fetcher);

  return {
    comments: response.data?.data.items ?? [],
    totalCount: response.data?.data.totalCount ?? 0,
    pageInfo: response.data?.data.pageInfo,
    isLoading: !response.error && !response.data,
    isError: response.error,
    mutateComments: response.mutate,
  };
};

export default useComments;
