import { useState } from 'react';
import { useResults } from '@/hooks/fleets/results/useResults';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface QueryResultsProps {
  teamId: string;
  queryName: string;
}

const QueryResults = ({ teamId, queryName }: QueryResultsProps) => {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState({
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

  const getActionBadgeClass = (action: string) => {
    if (action === 'added') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (action === 'removed') {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

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
              <summary className="cursor-pointer px-4 py-3 flex items-center gap-3 list-none">
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />

                <div className="flex-1 flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-muted-foreground min-w-[140px]">
                    {result.timestamp
                      ? format(
                          new Date(result.timestamp),
                          'yyyy-MM-dd HH:mm:ss'
                        )
                      : '-'}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {result.node?.display_name ||
                      result.node?.host_identifier ||
                      '-'}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionBadgeClass(result.action)}`}
                  >
                    {result.action || 'snapshot'}
                  </span>
                </div>
              </summary>

              <div className="px-4 pb-4 pt-2 ml-7 border-t border-border">
                <div className="space-y-2">
                  {result.columns && typeof result.columns === 'object' ? (
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
