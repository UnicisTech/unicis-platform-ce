import fetcher from '@/lib/fetcher';
import type { Team } from '@prisma/client';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse } from 'types';

const useTeam = (slug?: string) => {
  const { query, isReady } = useRouter();

  const teamSlug = slug || (isReady ? query.slug : null);

  const { data, error, isLoading } = useSWR<ApiResponse<Team>>(
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
    mutateTeam
  };
};

export default useTeam;
