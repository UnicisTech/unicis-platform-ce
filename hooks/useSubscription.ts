import fetcher from '@/lib/fetcher';
import type { Permission } from '@/lib/subscriptions';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse } from 'types';

const useSubscription = (slug?: string) => {
  const { query, isReady } = useRouter();

  const teamSlug = slug || (isReady ? query.slug : null);

  const { data, error, isLoading } = useSWR<ApiResponse<Permission>>(
    teamSlug ? `/api/teams/${teamSlug}/subscription` : null,
    fetcher
  );

  const mutateSubscription = async () => {
    mutate(`/api/teams/${teamSlug}/subscription`);
  };

  return {
    isLoading,
    isError: error,
    subscription: data?.data,
    mutateSubscription,
  };
};

export default useSubscription;
