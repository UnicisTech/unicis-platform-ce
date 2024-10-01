import { getAxiosError } from '@/lib/common';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Category, Course } from '@prisma/client';
import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, IapCourse, TeamCourseWithProgress, TeamWithSubscription } from 'types';

const useIapCourse = (slug: string, courseId: string) => {
    const { query, isReady } = useRouter();

    const teamSlug = slug || (isReady ? query.slug : null);

    const { data, error, isLoading } = useSWR<ApiResponse<TeamCourseWithProgress>>(
        teamSlug ? `/api/teams/${teamSlug}/iap/course/${courseId}` : null,
        fetcher
    );


    const mutateCourse = () => {
        mutate(`/api/teams/${teamSlug}/iap/course/${courseId}`);
    };

    return {
        isLoading,
        isError: error,
        teamCourse: data?.data,
        mutateCourse,
    };
};

export default useIapCourse;
