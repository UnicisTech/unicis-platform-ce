import { getAxiosError } from '@/lib/common';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Category, Course } from '@prisma/client';
import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, IapCourseWithProgress, TeamCourseWithProgress, TeamWithSubscription } from 'types';

const useIap = (slug?: string) => {
    const { query, isReady } = useRouter();

    const teamSlug = slug || (isReady ? query.slug : null);

    const { data: categories, error: categoriesError, isLoading: isCategoriesLoading } = useSWR<ApiResponse<Category[]>>(
        teamSlug ? `/api/teams/${teamSlug}/iap/category` : null,
        fetcher
    );

    const { data: teamCourses, error: coursesError, isLoading: isCoursesLoading } = useSWR<ApiResponse<TeamCourseWithProgress[]>>(
        teamSlug ? `/api/teams/${teamSlug}/iap/course` : null,
        fetcher
    );


    console.log('useIAP categories', categories)

    console.log('useIAP teamCourses', teamCourses)

    const mutateIap = async () => {
        await mutate(`/api/teams/${teamSlug}/iap/category`);
        await mutate(`/api/teams/${teamSlug}/iap/course`);
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
