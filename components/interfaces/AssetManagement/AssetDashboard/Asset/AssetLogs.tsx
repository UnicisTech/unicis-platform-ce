import { useState } from 'react';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';
import { Error, Loading } from '@/components/shared';
import type { User } from '@/generated/client';
// import { IssuePanelContainer } from '@/sharedStyles';
import { useAssetLogs } from '@/hooks/fleets/Nodes';
import TableBuilder from '../../TableBuilder';
import { useDeleteAssetLog } from '@/hooks/fleets/Nodes/useDeleteAssetLog';

const AssetLogs = ({
  fleetTeamId,
  nodeID,
  user: _user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  nodeID: string;
}) => {
  const { slug } = useRouter().query as { slug: string };
  const { canAccess } = useCanAccess(slug);
  const [, setStatusToDelete] = useState<string>();
  const deleteLog = useDeleteAssetLog();

  const { logs, isLoading, isError, mutateAssetLogs } = useAssetLogs(
    fleetTeamId,
    nodeID
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

  const handleDeleteStatus = (id: string) => {
    deleteLog(fleetTeamId, nodeID, id);
    setStatusToDelete(id);
    mutateAssetLogs();
  };

  return (
    // <IssuePanelContainer>
    <TableBuilder
      data={logs?.status_logs ?? []}
      onDelete={
        canAccess('team_fleet_node', ['delete'])
          ? handleDeleteStatus
          : undefined
      }
    />
    // </IssuePanelContainer>
  );
};

export default AssetLogs;
