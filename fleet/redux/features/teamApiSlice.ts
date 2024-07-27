'use client'
import { apiSlice } from '../services/apiSlice';

interface Token {
	token_name: string;
	team_name: string;
	token: string;
}

const teamApiSlice = apiSlice.injectEndpoints({
	endpoints: builder => ({

		createTeam: builder.mutation({
			query: ({
				name
			}) => ({
				url: '/v1/team/create',
				method: 'POST',
				body: { name },
			}),
		}),

		createAPIToken: builder.mutation({
			query: ({ token_name, team_name }: Token) => ({
				url: `/v1/team/create-token`,
				method: 'POST',
				body: { token_name, team_name }
			}),
		}),

		retrieveTokens: builder.query<Token[], void>({
			query: () => '/v1/team/tokens',
		}),
	}),
});

export const {
	useCreateTeamMutation,
	useCreateAPITokenMutation,
	useRetrieveTokensQuery,
} = teamApiSlice;
