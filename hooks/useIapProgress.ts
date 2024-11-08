
import type { CourseProgress } from '@prisma/client';
import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse } from 'types';

const useIapProgress = (slug?: string, courseId?: string) => {
    const { query, isReady } = useRouter();

    const teamSlug = slug || (isReady ? query.slug : null);

    const { data, error, isLoading } = useSWR<ApiResponse<CourseProgress | null>>(
        (teamSlug && courseId ) ? `/api/teams/${teamSlug}/iap/course/${courseId}/progress` : null,
        fetcher
    );


    const mutateProgress = () => {
        mutate(`/api/teams/${teamSlug}/iap/course/${courseId}/progress`);
    };

    return {
        isLoading,
        isError: error,
        userProgress: data?.data,
        mutateProgress,
    };
};

export default useIapProgress;
