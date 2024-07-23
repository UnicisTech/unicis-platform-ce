'use client'
import { accountSlice } from '../services/userSlice';


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

interface Profile {
	bio: string,
	phone_number: number,
	website: string,
	location: string,
	date_of_birth: string,
	language: string,
	profile_picture: string,
	background_image: string,
	avatar: string,
}

interface Address {
	id: string, 
	street: string, 
	city: string,    
	state: string, 
	postal_code: string, 
    country: string
}

interface Social {
	id: string;
	platform: string,
	username: string, 
	link: string
}

interface Socials {
	count: number,
	data: [Social],
}

interface ProfileImage {
	profile_picture: any,
	background_image: any,
	avatar: any,
}


const userApiSlice = accountSlice.injectEndpoints({
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
