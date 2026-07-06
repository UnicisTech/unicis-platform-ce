import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import type { ApiResponse, ISO } from 'types';

/** Enabled CSC frameworks for a team, used to size the header's control count. */
const useCscIso = (slug?: string) => {
  const { data, error } = useSWR<ApiResponse<{ iso: ISO[] }>>(
    slug ? `/api/teams/${slug}/csc/iso` : null,
    fetcher
  );

  return {
    iso: data?.data?.iso,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useCscIso;
