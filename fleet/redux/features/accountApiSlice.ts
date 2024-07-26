'use client'
import { apiSlice } from '../services/apiSlice';

const accountApiSlice = apiSlice.injectEndpoints({
	endpoints: builder => ({

		createUser: builder.mutation({
			query: ({
				fiestname,
				lastName,
				email,
				password
			}) => ({
				url: '/v1/account/create',
				method: 'POST',
				body: { fiestname, lastName, email, password },
			}),
		}),

		access: builder.mutation({
			query: ({ email, password }) => ({
				url: '/v1/account/access',
				method: 'POST',
				body: { email, password },
			}),
		}),

	}),
});

export const {
	useCreateUserMutation,
	useAccessMutation,
} = accountApiSlice;
