import fetcher from '@/lib/fetcher';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, TeamWithMemberCountDto } from 'types';

const useTeams = () => {
  const url = `/api/teams`;

  const { data, error, isLoading } = useSWR<
    ApiResponse<TeamWithMemberCountDto[]>
  >(url, fetcher);

  const mutateTeams = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    teams: data?.data,
    mutateTeams,
  };
};

export default useTeams;
