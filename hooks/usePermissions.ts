import fetcher from '@/lib/fetcher';
import type { Permission } from '@/lib/permissions';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import type { ApiResponse } from 'types';

const usePermissions = () => {
  const { query, isReady } = useRouter();
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;

  const shouldFetch = isReady && typeof slug === 'string';

  const { data, error, isLoading } = useSWR<ApiResponse<Permission[]>>(
    shouldFetch ? `/api/teams/${slug}/permissions` : null,
    fetcher
  );

  return {
    isLoading,
    isError: !!error,
    permissions: data?.data,
  };
};

export default usePermissions;
