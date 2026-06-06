import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import type { User } from '@/generated/client';
import DeleteQuery from './DeleteDistributorResult';
// import { IssuePanelContainer } from '@/sharedStyles';
import { useGetDistributedIdResult } from '@/hooks/fleets/distributors/useGetDistributorIdResult';
import DataInfo from '@/components/shared/DataInfo';
import { CodeBlock } from '@/components/shared/CodeBlock';

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
  const [status] = useState<'new' | 'pending' | 'complete' | 'failed'>('new');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete] = useState<null | string>(null);

  const { distributorsResult, isLoading, isError } = useGetDistributedIdResult(
    fleetTeamId,
    distributorId,
    status
  );

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
    <div>
      <div className="grid gap-2 text-black">
        <div className="grid grid-cols-2 gap-2">
          <DataInfo
            header={t('id')}
            data={distributorsResult?.distributed_id}
          />
          <DataInfo
            header={t('script-status')}
            data={distributorsResult?.status}
          />
          <DataInfo
            header={t('script-query-id')}
            data={distributorsResult?.query.id}
          />
          <DataInfo
            header={t('created-at')}
            data={distributorsResult?.query?.created_at}
          />
          <DataInfo
            header={t('updated-at')}
            data={distributorsResult?.query?.updated_at}
          />
        </div>
        <div className="items-center justify-start">
          <CodeBlock
            language="sql"
            shouldWrapLongLines
            i18nIsDynamicList
            showLineNumbers={false}
            text={distributorsResult?.query?.sql ?? ''}
          />
        </div>
      </div>
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
