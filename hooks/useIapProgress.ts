import { getAxiosError } from '@/lib/common';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Category, CourseProgress } from '@prisma/client';
import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, TeamWithSubscription } from 'types';

const useIapProgress = (slug?: string, courseId?: string, userId?: string) => {
    const { query, isReady } = useRouter();

    const teamSlug = slug || (isReady ? query.slug : null);

    const { data, error, isLoading } = useSWR<ApiResponse<CourseProgress | null>>(
        (teamSlug && courseId && userId) ? `/api/teams/${teamSlug}/iap/course/${courseId}/progress` : null,
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
