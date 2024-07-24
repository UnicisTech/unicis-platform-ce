'use client'
import { apiSlice } from '../services/apiSlice';

interface Token {
	name: string;
	token: string;
}

const authApiSlice = apiSlice.injectEndpoints({
	endpoints: builder => ({

		createAPIToken: builder.mutation({
			query: ({ username, email, token_name }) => ({
				url: `/v1/account/token`,
				method: 'POST',
				body: {username, email, token_name}
			}),
		}),

		retrieveTokens: builder.query<Token[], void>({
			query: () => '/v1/account/tokens',
		}),
	}),
});

export const {
	useCreateAPITokenMutation,
	useRetrieveTokensQuery,
} = authApiSlice;
