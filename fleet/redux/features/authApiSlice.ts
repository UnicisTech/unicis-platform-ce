'use client'
import { apiSlice } from '../services/apiSlice';

interface User {
	id: string;
	username: string;
	get_full_name: string;
	bio: string;
	phone_number: number;
	avatar: string;
	first_name: string;
	last_name: string;
	other_name: string;
	email: string;
}

interface Users {
	data: [User],
}

interface SocialAuthArgs {
	provider: string;
	state: string;
	code: string;
}

interface CreateUserResponse {
	success: boolean;
	user: User;
}

const authApiSlice = apiSlice.injectEndpoints({
	endpoints: builder => ({

		createAPIToken: builder.mutation({
			query: ({ token_name }) => ({
				url: `/v1/api-token/`,
				method: 'POST',
				body: {token_name}
			}),
		}),


		login: builder.mutation({
			query: ({ email, password }) => ({
				url: '/v1/auth/login',
				method: 'POST',
				body: { email, password },
			}),
		}),

		register: builder.mutation({
			query: ({
				username,
				email,
				password
			}) => ({
				url: '/v1/auth/register',
				method: 'POST',
				body: { username, email, password },
			}),
		}),

		verify: builder.mutation({
			query: () => ({
				url: '/v1/auth/verify',
				method: 'POST',
			}),
		}),

		logout: builder.mutation({
			query: () => ({
				url: '/v1/auth/logout',
				method: 'POST',
			}),
		}),

		activation: builder.mutation({
			query: ({ uid, token }) => ({
				url: '/users/activation/',
				method: 'POST',
				body: { uid, token },
			}),
		}),

		resetPassword: builder.mutation({
			query: email => ({
				url: '/users/reset_password/',
				method: 'POST',
				body: { email },
			}),
		}),

		resetPasswordConfirm: builder.mutation({
			query: ({ uid, token, new_password, re_new_password }) => ({
				url: '/users/reset_password_confirm/',
				method: 'POST',
				body: { uid, token, new_password, re_new_password },
			}),
		}),

	}),
});

export const {
	useCreateAPITokenMutation,
	useLoginMutation,
	useRegisterMutation,
	useVerifyMutation,
	useLogoutMutation,
	useActivationMutation,
	useResetPasswordMutation,
	useResetPasswordConfirmMutation
} = authApiSlice;
