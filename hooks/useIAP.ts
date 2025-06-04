import type { Category } from '@prisma/client';
import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, TeamCourseWithProgress } from 'types';

const useIap = (adminAccess: boolean, slug?: string) => {
  const { query, isReady } = useRouter();

  const teamSlug = slug || (isReady ? query.slug : null);

  const {
    data: categories,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useSWR<ApiResponse<Category[]>>(
    teamSlug ? `/api/teams/${teamSlug}/iap/category` : null,
    fetcher
  );

  const {
    data: teamCourses,
    error: coursesError,
    isLoading: isCoursesLoading,
  } = useSWR<ApiResponse<TeamCourseWithProgress[]>>(
    teamSlug
      ? `/api/teams/${teamSlug}/iap/course?${adminAccess ? 'role=admin' : ''}`
      : null,
    fetcher
  );

  const mutateIap = async () => {
    mutate(`/api/teams/${teamSlug}/iap/category`);
    mutate(`/api/teams/${teamSlug}/iap/course?${adminAccess ? 'role=admin' : ''}`);
  };

  return {
    isLoading: isCategoriesLoading || isCoursesLoading,
    isError: categoriesError || coursesError,
    categories: categories?.data,
    teamCourses: teamCourses?.data,
    mutateIap,
  };
};

export default useIap;
