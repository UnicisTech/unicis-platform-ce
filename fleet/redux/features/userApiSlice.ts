'use client'
import { apiSlice } from '../services/apiSlice';


interface User {
	id: string;
	username: string;
	get_full_name: string;
	first_name: string;
	last_name: string;
	other_name: string;
	email: string;
	bio: string;
	location: string;
}


const userApiSlice = apiSlice.injectEndpoints({
	endpoints: builder => ({

		// [GET] QUERY FOR USER ACCOUNT

		getUser: builder.query<User, string>({
			query: (username: string) => `/${username}`,
		}),

		// [POST, PUT, DELETE, PATCH] MUTATIONS FOR USER ACCOUNT

		updateUser: builder.mutation({
			query: ({
				first_name,
				last_name,
				other_name,
			}) => ({
				url: '/v1/user-update/',
				method: 'PATCH',
				body: { first_name, last_name, other_name },
			}),
			invalidatesTags: ['User']
		}),

		deleteAccount: builder.mutation({
			query: ({
				action
			}) => ({
				url: '/v1/auth/users/',
				method: 'DELETE',
				body: {action}
			}),
		}),

		updateUsername: builder.mutation({
			query: ({
				username,
			}) => ({
				url: '/v1/username-update/',
				method: 'PATCH',
				body: { username },
			}),
			invalidatesTags: [{ type: 'User' }]
		}),

		changePassword: builder.mutation({
			query: ({ current_password, new_password, re_new_password }) => ({
				url: '/v1/users/set_password/',
				method: 'POST',
				body: { current_password, new_password, re_new_password },
			}),
		}),

		retrieveUser: builder.query<User, void>({
			query: () => '/v1/account/me',
			providesTags: ['User']
		}),
	}),
});

export const {
	useGetUserQuery,
	useUpdateUserMutation,
	useUpdateUsernameMutation,
	useDeleteAccountMutation,
} = userApiSlice;
