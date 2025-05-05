import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import DeleteQuery from './DeleteDistributorResult';
import { useGetDistributedIdResult } from '@/hooks/fleets/distributors/useGetDistributorIdResult';
import DataInfo from '@/components/shared/DataInfo';
import { CodeBlock } from '@/components/shared/CodeBlock';


const DistributorsDetails = ({ user, distributorId, fleetTeamId }: { user: Partial<User>, distributorId: string, fleetTeamId: string }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [status, setStatus] = useState<'new' | 'pending' | 'complete' | 'failed'>('new');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);

  const { distributorsResult, isLoading, isError, mutateDistributorResult } = useGetDistributedIdResult(fleetTeamId, distributorId, status);

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

  const openDeleteModal = async (id: string) => {
    setQueryToDelete(id);
    setDeleteVisible(true);
    mutateDistributorResult();
  };

  return (
    <IssuePanelContainer>
      <div className='grid gap-2 text-black'>
        <div className="grid grid-cols-2 gap-2">
          <DataInfo header='ID' data={distributorsResult?.distributed_id} />
          <DataInfo header='Script Status' data={distributorsResult?.status} />
          <DataInfo header='Script Query ID' data={distributorsResult?.query.id} />
          <DataInfo header='Created At' data={distributorsResult?.query?.created_at} />
          <DataInfo header='Updated At' data={distributorsResult?.query?.updated_at} />
        </div>
        <div className="items-center justify-start">
          <CodeBlock language="sql" shouldWrapLongLines codeBidiWarningTooltipEnabled i18nIsDynamicList={true} showLineNumbers={false} text={distributorsResult?.query?.sql!} />
        </div>
      </div>
      <DeleteQuery
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        distributorId={queryToDelete!}
        fleetTeamId={fleetTeamId!}
      />
    </IssuePanelContainer>
  );
};

export default DistributorsDetails;
