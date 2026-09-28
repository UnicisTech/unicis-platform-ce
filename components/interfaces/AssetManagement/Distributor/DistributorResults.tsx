import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Error, Loading } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Button } from '@/components/shadcn/ui/button';
import { useGetDistributedIdResult } from '@/hooks/fleets/distributors/useGetDistributorIdResult';
import { useDeleteDistributedResult } from '@/hooks/fleets/distributors/useDeleteDistributorResult';
import {
  getDistributorStatusBadgeClass,
  getResultQueryLabel,
} from '../resultDisplay';

interface DistributorResultsProps {
  distributorId: string;
  fleetTeamId: string;
}

const DistributorResults = ({
  distributorId,
  fleetTeamId,
}: DistributorResultsProps) => {
  const { t } = useTranslation('common');
  const [status] = useState<'new' | 'pending' | 'complete' | 'failed'>(
    'complete'
  );
  const [page, setPage] = useState(1);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<string | null>(null);
  const deleteResult = useDeleteDistributedResult();

  const { distributorsResult, isLoading, isError, mutateDistributorResult } =
    useGetDistributedIdResult(fleetTeamId, distributorId, status, page);

  const handleDeleteResult = async () => {
    if (!resultToDelete) {
      return false;
    }

    await deleteResult(fleetTeamId, distributorId, resultToDelete);
    mutateDistributorResult();
  };

  const closeDeleteDialog = () => {
    setDeleteVisible(false);
    setResultToDelete(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const results = distributorsResult?.results || [];
  const pagination = distributorsResult?.pagination;
  const currentPage = Number(pagination?.page ?? page);
  const totalRecords = Number(pagination?.total ?? 0);
  const perPage = Number(pagination?.per_page ?? 0);
  const totalPages =
    totalRecords > 0 && perPage > 0 ? Math.ceil(totalRecords / perPage) : 0;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage =
    totalPages > 0 ? currentPage < totalPages : results.length > 0;

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {results.length > 0 ? (
          <>
            {t('showing')} {results.length}{' '}
            {t('results-from-distributed-query')}
          </>
        ) : (
          t('no-results-yet-distributed-query')
        )}
      </div>

      {/* Empty State */}
      {results.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('no-results-found')}
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result: any, index: number) => {
            const resultId = result.result_id || result.id || index;
            const queryLabel = getResultQueryLabel(
              result.display_query_name,
              result.query_name || result.name
            );

            return (
              <details
                key={resultId}
                className="group rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <summary className="cursor-pointer px-4 py-3 grid grid-cols-[24px_150px_minmax(140px,220px)_minmax(240px,1fr)_auto_auto] items-center gap-4 list-none">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />

                  <span className="text-sm text-muted-foreground">
                    {result.timestamp
                      ? format(
                          new Date(result.timestamp),
                          'yyyy-MM-dd HH:mm:ss'
                        )
                      : t('no-timestamp')}
                  </span>

                  <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {queryLabel.type && (
                      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {queryLabel.type}:
                      </span>
                    )}
                    {queryLabel.label}
                  </span>

                  <div className="min-w-0 space-y-1 break-words text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                    <div className="flex flex-wrap gap-x-1">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {t('host-identifier')}:{' '}
                      </span>
                      <span className="break-all font-mono text-[12px]">
                        {result.host_identifier || t('unknown-host')}
                      </span>
                    </div>
                  </div>

                  {result.status ? (
                    <span
                      className={`inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold ${getDistributorStatusBadgeClass(result.status)}`}
                    >
                      {result.status}
                    </span>
                  ) : (
                    <span />
                  )}

                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setResultToDelete(String(resultId));
                      setDeleteVisible(true);
                    }}
                    aria-label={t('delete-result')}
                    title={t('delete-result')}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </summary>

                <div className="px-4 pb-4 pt-2 ml-7 border-t border-border">
                  <div className="space-y-2">
                    {Object.entries(result)
                      .filter(
                        ([key]) =>
                          ![
                            'result_id',
                            'id',
                            'timestamp',
                            'host_identifier',
                            'status',
                            'display_query_name',
                            'query_name',
                            'name',
                          ].includes(key)
                      )
                      .map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
                            {key}:
                          </span>
                          <span className="text-sm font-mono">
                            {value === null || value === undefined
                              ? '-'
                              : typeof value === 'object'
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {(hasPreviousPage || hasNextPage) && (
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div className="text-sm text-muted-foreground">
            {t('page')} {currentPage}
            {totalPages > 0 ? ` ${t('of')} ${totalPages}` : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={!hasPreviousPage}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              {t('previous')}
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={!hasNextPage}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}

      <ConfirmationDialog
        visible={deleteVisible}
        onCancel={closeDeleteDialog}
        onConfirm={handleDeleteResult}
        title={t('delete-result')}
      >
        <div className="space-y-3">
          <p className="text-muted-foreground">{t('confirm-delete-result')}</p>
          <dl className="rounded-md border bg-muted/30 px-3 py-2.5">
            <dt className="text-xs font-medium text-muted-foreground">
              {t('id')}
            </dt>
            <dd className="mt-1 break-all font-mono text-sm font-medium text-foreground">
              {resultToDelete}
            </dd>
          </dl>
        </div>
      </ConfirmationDialog>
    </div>
  );
};

export default DistributorResults;
