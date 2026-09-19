import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import type { User } from '@/generated/client';
import DeleteQuery from './DeleteDistributorResult';
// import { IssuePanelContainer } from '@/sharedStyles';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';
import DataInfo from '@/components/shared/DataInfo';
import { CodeBlock } from '@/components/shared/CodeBlock';
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardHeader,
} from '@/components/shared';
import StatusValue from '../StatusValue';
import { stripHtmlPreview } from '../textPreview';

const DistributorsDetails = ({
  user: _user,
  distributorId,
  fleetTeamId,
}: {
  user: Partial<User>;
  distributorId: string;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete] = useState<null | string>(null);

  const { tasks, isLoading, isError } = useDistributors(fleetTeamId);
  const distributorTask = tasks.find(
    (task) => task.distributed_query?.id === distributorId
  );
  const distributor = distributorTask?.distributed_query;
  const description = stripHtmlPreview(distributor?.description);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <Error />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <ManagementCard>
        <ManagementCardHeader
          title={t('details')}
          description={t('distributed-query-details', {
            defaultValue: 'Distributed query details',
          })}
        />
        <ManagementCardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DataInfo
              header={t('id')}
              data={distributor?.id ?? distributorId}
            />
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="truncate border-b border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                {t('script-status')}
              </div>
              <div className="break-words px-2.5 py-1.5 text-[12px] text-slate-900 dark:text-slate-100">
                {typeof distributorTask?.status === 'number' ? (
                  <StatusValue status={distributorTask.status} />
                ) : (
                  t('not-available', { defaultValue: 'N/A' })
                )}
              </div>
            </div>
            <DataInfo
              header={t('script-query-id')}
              data={distributor?.id}
            />
            <DataInfo
              header={t('created-at')}
              data={distributor?.created_at}
            />
            <DataInfo
              header={t('updated-at')}
              data={distributor?.updated_at}
            />
          </div>

          {description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('description')}
              </h3>
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t('sql-code')}
            </h3>
            <CodeBlock
              language="sql"
              shouldWrapLongLines
              showLineNumbers={false}
              text={distributor?.sql ?? ''}
            />
          </div>
        </ManagementCardContent>
      </ManagementCard>

      <DeleteQuery
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        distributorId={queryToDelete!}
        fleetTeamId={fleetTeamId!}
      />
    </div>
  );
};

export default DistributorsDetails;
