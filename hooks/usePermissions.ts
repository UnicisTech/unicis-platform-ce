import fetcher from '@/lib/fetcher';
import type { Permission } from '@/lib/permissions';
import useSWR from 'swr';
import type { ApiResponse } from 'types';

const usePermissions = (slug?: string) => {
  const shouldFetch = typeof slug === 'string' && slug.length > 0;

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
