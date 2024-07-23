'use client'
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/fleet/redux/services/BaseQueryAuth'

const path = 'account'

export const accountSlice = createApi({
	reducerPath: path,
	baseQuery: baseQueryWithReauth(path),
    tagTypes: ['User'],
	endpoints: builder => ({}),
});
