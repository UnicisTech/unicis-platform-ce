import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import DeleteQuery from './DeleteDistributorResult';
import { useGetDistributedIdResult } from '@/hooks/fleets/distributors/useGetDistributorIdResult';
import { CodeBlock } from '@atlaskit/code';
import FormattedDate from '@/components/shared/Date';


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
        <span className="flex items-center gap-2 bg-blue-200 rounded-badge px-2">ID: {distributorsResult?.distributed_id}</span>
        <div className="rounded-xs">
          {distributorsResult?.query?.id}
          <span className="ml-2">Team: {distributorsResult?.query?.team.id}</span>
          <span className="ml-2">Shard: {distributorsResult?.query?.shard}</span>
          <span className="ml-2">Created At: <FormattedDate style={``} dateString={distributorsResult?.query.created_at} /></span>
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
