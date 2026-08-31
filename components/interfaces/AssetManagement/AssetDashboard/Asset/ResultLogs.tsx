import { useState } from 'react';
import type { User } from '@/generated/client';
import { useResults } from '@/hooks/fleets/results/useResults';
import { useDeleteAssetResultLog } from '@/hooks/fleets/Nodes/useDeleteResult';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardHeader,
} from '@/components/shared';
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
  const { t } = useTranslation(['common', 'fleet']);
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
  const resultsDescription = isLoading ? (
    t('loading')
  ) : total > 0 ? (
    <>
      {t('showing')} {filters.offset + 1} -{' '}
      {Math.min(filters.offset + filters.limit, total)} {t('of')} {total}{' '}
      {t('results-from-this-asset')}
    </>
  ) : (
    t('no-results-yet-queries-run')
  );

  if (isError) {
    return (
      <ManagementCard>
        <ManagementCardHeader
          title={t('fleet:tab-result-logs')}
          description={resultsDescription}
        />
        <ManagementCardContent className="p-4 text-sm text-destructive">
          {t('error-loading-results')}
        </ManagementCardContent>
      </ManagementCard>
    );
  }

  return (
    <ManagementCard>
      <ManagementCardHeader
        title={t('fleet:tab-result-logs')}
        description={resultsDescription}
      />

      {isLoading && (
        <ManagementCardContent className="p-8 text-center text-sm text-muted-foreground">
          {t('loading')}
        </ManagementCardContent>
      )}

      {!isLoading && results.length === 0 && (
        <ManagementCardContent className="p-8 text-center text-sm text-muted-foreground">
          {t('no-results-found')}
        </ManagementCardContent>
      )}

      {!isLoading && results.length > 0 && (
        <ManagementCardContent>
          <div className="hidden grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:grid dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <span className="w-4" aria-hidden="true" />
            <div className="grid min-w-0 grid-cols-[150px_minmax(140px,220px)_minmax(280px,1fr)_auto] gap-4">
              <span>{t('fleet:fleet-timestamp')}</span>
              <span>{t('query')}</span>
              <span>{t('asset')}</span>
              <span>{t('action')}</span>
            </div>
            <span className="w-8" aria-hidden="true" />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {results.map((result) => {
              const queryLabel = getResultQueryLabel(
                result.display_query_name,
                result.query_name
              );

              return (
                <details
                  key={result.id}
                  className="group transition-colors hover:bg-slate-50/70 open:bg-slate-50/50 dark:hover:bg-slate-900/60 dark:open:bg-slate-900/40"
                >
                  <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-3.5 lg:items-center [&::-webkit-details-marker]:hidden">
                    <ChevronRight
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90 lg:mt-0"
                      aria-hidden="true"
                    />

                    <div className="min-w-0 space-y-2.5 lg:grid lg:grid-cols-[150px_minmax(140px,220px)_minmax(280px,1fr)_auto] lg:items-center lg:gap-4 lg:space-y-0">
                      <span className="block min-w-0 truncate text-sm font-semibold text-slate-800 lg:col-start-2 lg:row-start-1 dark:text-slate-100">
                        {queryLabel.type && (
                          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {queryLabel.type}:
                          </span>
                        )}
                        {queryLabel.label}
                      </span>

                      <time
                        dateTime={result.timestamp || undefined}
                        className="block whitespace-nowrap text-xs text-muted-foreground lg:col-start-1 lg:row-start-1 lg:text-sm"
                      >
                        {result.timestamp
                          ? format(
                              new Date(result.timestamp),
                              'yyyy-MM-dd HH:mm:ss'
                            )
                          : '-'}
                      </time>

                      <div className="min-w-0 lg:col-start-3 lg:row-start-1">
                        <ResultNodeInfo node={result.node} />
                      </div>

                      <span
                        className={`inline-flex w-fit justify-center rounded-full px-3 py-1 text-xs font-semibold lg:col-start-4 lg:row-start-1 ${getResultActionBadgeClass(result.action)}`}
                      >
                        {result.action || 'snapshot'}
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void handleDeleteResult(result.id);
                      }}
                      disabled={deletingId === result.id}
                      className="h-8 w-8 justify-self-end text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title={t('delete-result')}
                      aria-label={t('delete-result')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </summary>

                  <div className="border-t border-slate-100 bg-white/70 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/40 sm:pl-11">
                    <div className="space-y-2">
                      {result.action === 'failed' ? (
                        <ResultErrorMessage error={result.columns?.error} />
                      ) : result.columns &&
                        typeof result.columns === 'object' ? (
                        Object.entries(result.columns).map(([key, value]) => (
                          <div
                            key={key}
                            className="grid min-w-0 gap-1 sm:grid-cols-[minmax(120px,auto)_minmax(0,1fr)] sm:gap-3"
                          >
                            <span className="text-sm font-medium text-muted-foreground">
                              {key}:
                            </span>
                            <span className="min-w-0 whitespace-pre-wrap break-words font-mono text-sm [overflow-wrap:anywhere]">
                              {typeof value === 'object'
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <pre className="max-w-full overflow-auto rounded bg-muted p-2 font-mono text-xs">
                          {JSON.stringify(result.columns, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </ManagementCardContent>
      )}

      {total > filters.limit && (
        <ManagementCardFooter className="sm:justify-between">
          <div className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(filters.offset - filters.limit)}
              disabled={filters.offset === 0}
            >
              {t('previous')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(filters.offset + filters.limit)}
              disabled={filters.offset + filters.limit >= total}
            >
              {t('next')}
            </Button>
          </div>
        </ManagementCardFooter>
      )}
    </ManagementCard>
  );
};

export default ResultLogs;
