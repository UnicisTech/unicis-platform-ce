import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Error, Loading } from '@/components/shared';
import { useGetDistributedIdResult } from '@/hooks/fleets/distributors/useGetDistributorIdResult';
import { useDeleteDistributedResult } from '@/hooks/fleets/distributors/useDeleteDistributorResult';

interface DistributorResultsProps {
  distributorId: string;
  fleetTeamId: string;
}

const DistributorResults = ({ distributorId, fleetTeamId }: DistributorResultsProps) => {
  const { t } = useTranslation('common');
  const [status, setStatus] = useState<'new' | 'pending' | 'complete' | 'failed'>('complete');
  const deleteResult = useDeleteDistributedResult();

  const { distributorsResult, isLoading, isError, mutateDistributorResult } =
    useGetDistributedIdResult(fleetTeamId, distributorId, status);

  const handleDeleteResult = async (id: string) => {
    if (confirm(t('Are you sure you want to delete this result?'))) {
      await deleteResult(fleetTeamId, distributorId, id);
      mutateDistributorResult();
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const results = distributorsResult?.results || [];

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {results.length > 0 ? (
          <>
            {t('Showing')} {results.length} {t('results from distributed query')}
          </>
        ) : (
          t('No results yet. Results will appear here after the distributed query executes.')
        )}
      </div>

      {/* Empty State */}
      {results.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {t('No results found')}
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result: any, index: number) => {
            const resultId = result.result_id || result.id || index;

            return (
              <details
                key={resultId}
                className="group rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <summary className="cursor-pointer px-4 py-3 flex items-center gap-3 list-none">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />

                  <div className="flex-1 flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-muted-foreground min-w-[140px]">
                      {result.timestamp
                        ? format(new Date(result.timestamp), 'yyyy-MM-dd HH:mm:ss')
                        : t('No timestamp')}
                    </span>

                    <span className="text-sm font-medium">
                      {result.host_identifier || t('Unknown host')}
                    </span>

                    {result.status && (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        result.status === 'complete'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : result.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {result.status}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteResult(String(resultId));
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title={t('Delete result')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </summary>

                <div className="px-4 pb-4 pt-2 ml-7 border-t border-border">
                  <div className="space-y-2">
                    {Object.entries(result)
                      .filter(([key]) => !['result_id', 'id', 'timestamp', 'host_identifier', 'status'].includes(key))
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
    </div>
  );
};

export default DistributorResults;
