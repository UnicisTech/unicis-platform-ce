import { useEffect, useMemo, useState } from 'react';
import { useResults } from '@/hooks/fleets/results/useResults';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';
import ResultNodeInfo from '../ResultNodeInfo';
import ResultErrorMessage from '../ResultErrorMessage';
import {
  getResultActionBadgeClass,
  getResultQueryLabel,
} from '../resultDisplay';

interface PackResultsProps {
  teamId: string;
  packId: string;
}

const PackResults = ({ teamId, packId }: PackResultsProps) => {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState({
    pack_id: packId,
    limit: 50,
    offset: 0,
  });
  const [fallbackResults, setFallbackResults] = useState<any[]>([]);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);

  const { results, total, isLoading, isError } = useResults(teamId, filters);

  useEffect(() => {
    let cancelled = false;

    const fetchFallbackPackResults = async () => {
      setIsFallbackLoading(true);
      try {
        const headers = await fleetAuthAPIHeaders();

        const packRes = await fleetV1(`/manager/${teamId}/pack/${packId}`, {
          method: 'GET',
          headers,
        });
        const packData = await packRes.json();

        const packName = packData?.name || '';
        let packQueries = (packData?.queries || [])
          .map((q: any) => q.name)
          .filter(Boolean);

        if (packQueries.length === 0) {
          try {
            const queriesRes = await fleetV1(`/manager/${teamId}/queries`, {
              method: 'GET',
              headers,
            });
            const queriesData = await queriesRes.json();
            const queries = queriesData?.queries || [];
            packQueries = queries
              .filter((q: any) =>
                (q?.packs || []).some((p: any) => p?.id === packId)
              )
              .map((q: any) => q?.name)
              .filter(Boolean);
          } catch {
            // Ignore queries enrichment failure and continue with prefix fallback
          }
        }

        const candidateQueryNames =
          packQueries.length > 0
            ? packQueries.flatMap((qName: string) => [
                `pack/${packName}/${qName}`,
                `pack_${packName}_${qName}`,
              ])
            : [
                packName ? `pack/${packName}/` : '',
                packName ? `pack_${packName}_` : '',
              ].filter(Boolean);

        const endpointResults = await Promise.all(
          candidateQueryNames.map(async (qName: string) => {
            try {
              const params = new URLSearchParams();
              params.set('query_name', qName);
              params.set('limit', '500');
              params.set('offset', '0');

              const res = await fleetV1(
                `/manager/${teamId}/results?${params.toString()}`,
                {
                  method: 'GET',
                  headers,
                }
              );
              const data = await res.json();
              return data?.results || [];
            } catch {
              return [];
            }
          })
        );

        const merged = endpointResults.flat();
        const seenIds = new Set<string>();
        const filtered = merged.filter((item: any) => {
          const id = String(item?.id || '');
          if (!id || seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });

        filtered.sort((a: any, b: any) => {
          const aTs = new Date(a.timestamp || a.created_at || 0).getTime();
          const bTs = new Date(b.timestamp || b.created_at || 0).getTime();
          return bTs - aTs;
        });

        if (!cancelled) setFallbackResults(filtered);
      } catch {
        if (!cancelled) setFallbackResults([]);
      } finally {
        if (!cancelled) setIsFallbackLoading(false);
      }
    };

    fetchFallbackPackResults();
    const timer = setInterval(fetchFallbackPackResults, 15000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [teamId, packId]);

  const effectiveResults = useMemo(() => {
    if (results.length > 0) return results as any[];
    return fallbackResults;
  }, [results, fallbackResults]);

  const effectiveTotal = results.length > 0 ? total : fallbackResults.length;
  const paginatedResults =
    results.length > 0
      ? effectiveResults
      : effectiveResults.slice(filters.offset, filters.offset + filters.limit);

  const handlePageChange = (newOffset: number) => {
    setFilters({ ...filters, offset: newOffset });
  };

  const totalPages = Math.ceil(effectiveTotal / filters.limit);
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {effectiveTotal > 0 ? (
          <>
            {t('showing')} {filters.offset + 1} -{' '}
            {Math.min(filters.offset + filters.limit, effectiveTotal)} {t('of')}{' '}
            {effectiveTotal} {t('results-from-scheduled-pack-queries')}
          </>
        ) : (
          t('no-results-yet-pack-queries')
        )}
      </div>

      {/* Loading State */}
      {(isLoading || (results.length === 0 && isFallbackLoading)) && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('loading')}
        </div>
      )}

      {/* Primary API Error (fallback may still render below) */}
      {isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-destructive text-sm">
          {t('error-loading-results')}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isFallbackLoading && paginatedResults.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('no-results-found')}
        </div>
      )}

      {/* Results List */}
      {!isLoading && paginatedResults.length > 0 && (
        <div className="space-y-2">
          {paginatedResults.map((result: any, index: number) => {
            const queryLabel = getResultQueryLabel(
              result.display_query_name,
              result.query_name || result.name
            );

            return (
              <details
                key={
                  result.id ||
                  `${result.name || 'result'}-${result.timestamp || index}`
                }
                className="group rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <summary className="cursor-pointer px-4 py-3 grid grid-cols-[24px_150px_minmax(140px,220px)_minmax(280px,1fr)_auto] items-center gap-4 list-none">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />

                  <span className="text-sm text-muted-foreground">
                    {result.timestamp
                      ? format(
                          new Date(result.timestamp),
                          'yyyy-MM-dd HH:mm:ss'
                        )
                      : '-'}
                  </span>

                  <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {queryLabel.type && (
                      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {queryLabel.type}:
                      </span>
                    )}
                    {queryLabel.label}
                  </span>

                  <ResultNodeInfo node={result.node || null} />

                  <span
                    className={`inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold ${getResultActionBadgeClass(result.action)}`}
                  >
                    {result.action || 'snapshot'}
                  </span>
                </summary>

                <div className="px-4 pb-4 pt-2 ml-7 border-t border-border">
                  <div className="space-y-2">
                    {result.action === 'failed' ? (
                      <ResultErrorMessage error={result.columns?.error} />
                    ) : result.columns && typeof result.columns === 'object' ? (
                      Object.entries(result.columns).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
                            {key}:
                          </span>
                          <span className="text-sm font-mono">
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <pre className="text-xs font-mono bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.columns, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {effectiveTotal > filters.limit && (
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div className="text-sm text-muted-foreground">
            {t('Page')} {currentPage} {t('of')} {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(filters.offset - filters.limit)}
              disabled={filters.offset === 0}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
            >
              {t('Previous')}
            </button>
            <button
              onClick={() => handlePageChange(filters.offset + filters.limit)}
              disabled={filters.offset + filters.limit >= effectiveTotal}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
            >
              {t('Next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackResults;
