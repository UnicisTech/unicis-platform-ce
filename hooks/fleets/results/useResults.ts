import useSWR from 'swr';
import fleetFetcher from '@/lib/fleet/fleetFetcher';

export interface ResultNode {
  id: string;
  node_key?: string;
  host_identifier: string;
  display_name: string;
  owner?: {
    id: string;
    role?: string;
    user?: {
      id?: string;
      firstname?: string;
      lastname?: string;
      email?: string;
    } | null;
  } | null;
}

export interface ResultData {
  id: string;
  query_name: string;
  display_query_name?: string;
  timestamp: string;
  action: string;
  columns: Record<string, any>;
  node: ResultNode | null;
}

export interface ResultsResponse {
  results: ResultData[];
  total: number;
  limit: number;
  offset: number;
}

export interface ResultsFilters {
  pack_id?: string;
  query_id?: string;
  query_name?: string;
  node_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export function useResults(teamId: string, filters?: ResultsFilters) {
  const params = new URLSearchParams();

  if (filters?.pack_id) params.append('pack_id', filters.pack_id);
  if (filters?.query_id) params.append('query_id', filters.query_id);
  if (filters?.query_name) params.append('query_name', filters.query_name);
  if (filters?.node_id) params.append('node_id', filters.node_id);
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const queryString = params.toString();
  const url = `/manager/${teamId}/results${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate } = useSWR<ResultsResponse>(url, fleetFetcher);

  return {
    results: data?.results || [],
    total: data?.total || 0,
    limit: data?.limit || 100,
    offset: data?.offset || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export interface ResultsSummary {
  total_results: number;
  recent_results_24h: number;
  unique_queries: number;
  unique_nodes: number;
}

export function useResultsSummary(teamId: string) {
  const url = `/manager/${teamId}/results/summary`;
  const { data, error, mutate } = useSWR<ResultsSummary>(url, fleetFetcher);

  return {
    summary: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
