import { useState } from 'react';
import type { User } from '@/generated/client';
import { useResults } from '@/hooks/fleets/results/useResults';
import { useDeleteAssetResultLog } from '@/hooks/fleets/Nodes/useDeleteResult';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight, Trash2 } from 'lucide-react';
import ResultNodeInfo from '../../ResultNodeInfo';
import ResultErrorMessage from '../../ResultErrorMessage';
import {
  getResultActionBadgeClass,
  getResultQueryLabel,
} from '../../resultDisplay';

const ResultLogs = ({
  fleetTeamId,
  nodeID,
  user: _user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  nodeID: string;
}) => {
  const { t } = useTranslation('common');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    node_id: nodeID,
    limit: 50,
    offset: 0,
  });
  const deleteLog = useDeleteAssetResultLog();

  const { results, total, isLoading, isError, mutate } = useResults(
    fleetTeamId,
    filters
  );

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

  if (isError) {
    return (
      <div className="p-4 text-destructive">{t('error-loading-results')}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {total > 0 ? (
          <>
            {t('showing')} {filters.offset + 1} -{' '}
            {Math.min(filters.offset + filters.limit, total)} {t('of')} {total}{' '}
            {t('results-from-this-asset')}
          </>
        ) : (
          t('no-results-yet-queries-run')
        )}
      </div>

      {isLoading && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('loading')}
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('no-results-found')}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => {
            const queryLabel = getResultQueryLabel(
              result.display_query_name,
              result.query_name
            );

            return (
              <details
                key={result.id}
                className="group rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <summary className="cursor-pointer px-4 py-3 grid grid-cols-[24px_150px_minmax(140px,220px)_minmax(280px,1fr)_auto_40px] items-center gap-4 list-none">
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

                  <ResultNodeInfo node={result.node} />

                  <span
                    className={`inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold ${getResultActionBadgeClass(result.action)}`}
                  >
                    {result.action || 'snapshot'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteResult(result.id);
                    }}
                    disabled={deletingId === result.id}
                    className="justify-self-end p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                    title={t('delete-result')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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

export default ResultLogs;
