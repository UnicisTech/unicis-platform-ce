import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, TeamWithSubscription } from 'types';

const useTeam = (slug?: string) => {
  const { query, isReady } = useRouter();

  const teamSlug = slug || (isReady ? query.slug : null);

  const { data, error, isLoading } = useSWR<ApiResponse<TeamWithSubscription>>(
    teamSlug ? `/api/teams/${teamSlug}` : null,
    fetcher
  );

  const mutateTeam = async () => {
    mutate(`/api/teams/${teamSlug}`);
  };

  return {
    isLoading,
    isError: error,
    team: data?.data,
    mutateTeam,
  };
};

export default useTeam;
