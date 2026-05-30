import { useState } from 'react';
import type { User } from '@/generated/client';
import { useResults } from '@/hooks/fleets/results/useResults';
import { useDeleteAssetResultLog } from '@/hooks/fleets/Nodes/useDeleteResult';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight, Trash2 } from 'lucide-react';


const ResultLogs = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {
  const { t } = useTranslation('common');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    node_id: nodeID,
    limit: 50,
    offset: 0,
  });
  const deleteLog = useDeleteAssetResultLog();

  const { results, total, isLoading, isError, mutate } = useResults(fleetTeamId, filters);

  const handleDeleteResult = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteLog(fleetTeamId, nodeID, id);
      await mutate();
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setFilters((prev) => ({ ...prev, offset: newOffset }));
  };

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

  if (isError) {
    return (
      <div className="p-4 text-destructive">
        {t('Error loading results')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {total > 0 ? (
          <>
            {t('Showing')} {filters.offset + 1} - {Math.min(filters.offset + filters.limit, total)} {t('of')}{' '}
            {total} {t('results from this asset')}
          </>
        ) : (
          t('No results yet. Results will appear here after queries run.')
        )}
      </div>

      {isLoading && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('Loading...')}
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('No results found')}
        </div>
      )}

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
                    {result.timestamp ? format(new Date(result.timestamp), 'yyyy-MM-dd HH:mm:ss') : '-'}
                  </span>

                  <span className="text-sm font-medium">{result.query_name || '-'}</span>

                  <span className="text-sm text-muted-foreground">
                    {result.node?.display_name || result.node?.host_identifier || '-'}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionBadgeClass(result.action)}`}
                  >
                    {result.action || 'snapshot'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteResult(result.id);
                  }}
                  disabled={deletingId === result.id}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                  title={t('Delete result')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </summary>

              <div className="px-4 pb-4 pt-2 ml-7 border-t border-border">
                <div className="space-y-2">
                  {result.columns && typeof result.columns === 'object' ? (
                    Object.entries(result.columns).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{key}:</span>
                        <span className="text-sm font-mono">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
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

      {total > filters.limit && (
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
              disabled={filters.offset + filters.limit >= total}
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

export default ResultLogs;
