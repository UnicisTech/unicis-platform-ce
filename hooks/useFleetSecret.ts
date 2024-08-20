import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, TeamWithSubscription } from 'types';

const useFleetSecret = (slug?: string) => {
  const { query, isReady } = useRouter();

  const teamSlug = slug || (isReady ? query.slug : null);

  const { data, error, isLoading } = useSWR<ApiResponse<TeamWithSubscription>>(
    teamSlug ? `/api/fleet/secret/${teamSlug}` : null,
    fetcher
  );

  const mutateTeam = async () => {
    mutate(`/api/fleet/secret/${teamSlug}`);
  };

  return {
    isLoading,
    isError: error,
    team: data?.data,
    mutateTeam,
  };
};

export default useFleetSecret;
