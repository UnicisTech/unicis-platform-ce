import { useState } from 'react';
import { useResults } from '@/hooks/fleets/results/useResults';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import ResultNodeInfo from '../ResultNodeInfo';
import ResultErrorMessage from '../ResultErrorMessage';
import { getResultActionBadgeClass } from '../resultDisplay';

interface QueryResultsProps {
  teamId: string;
  queryId: string;
  queryName: string;
}

const QueryResults = ({ teamId, queryId, queryName }: QueryResultsProps) => {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState({
    query_id: queryId,
    query_name: queryName,
    limit: 50,
    offset: 0,
  });

  const { results, total, isLoading, isError } = useResults(teamId, filters);

  const handlePageChange = (newOffset: number) => {
    setFilters({ ...filters, offset: newOffset });
  };

  if (isError) {
    return (
      <div className="p-4 text-destructive">{t('error-loading-results')}</div>
    );
  }

  const totalPages = Math.ceil(total / filters.limit);
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {total > 0 ? (
          <>
            {t('showing')} {filters.offset + 1} -{' '}
            {Math.min(filters.offset + filters.limit, total)} {t('of')} {total}{' '}
            {t('results-from-this-query')}
          </>
        ) : (
          t('no-results-yet-query-runs')
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('loading')}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('no-results-found')}
        </div>
      )}

      {/* Results List */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <details
              key={result.id}
              className="group rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <summary className="cursor-pointer px-4 py-3 grid grid-cols-[24px_150px_minmax(120px,180px)_minmax(280px,1fr)_auto] items-center gap-4 list-none">
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />

                <span className="text-sm text-muted-foreground">
                  {result.timestamp
                    ? format(new Date(result.timestamp), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </span>

                <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {result.display_query_name || result.query_name || '-'}
                </span>

                <ResultNodeInfo node={result.node} />

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
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > filters.limit && (
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div className="text-sm text-muted-foreground">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(filters.offset - filters.limit)}
              disabled={filters.offset === 0}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => handlePageChange(filters.offset + filters.limit)}
              disabled={filters.offset + filters.limit >= total}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryResults;
