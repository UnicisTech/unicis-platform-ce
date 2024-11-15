import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import { useAssetLogs } from '@/hooks/fleets/Nodes';
import TableBuilder from '../../TableBuilder';
import { useDeleteAssetLog } from '@/hooks/fleets/Nodes/useDeleteAssetLog';


const AssetLogs = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {

    const [status, setStatusToDelete] = useState<string>();
    const deleteLog = useDeleteAssetLog();

    const { logs, isLoading, isError, mutateAssetLogs } = useAssetLogs(fleetTeamId, nodeID);

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
        <IssuePanelContainer>
            <TableBuilder data={logs?.status_logs!} onDelete={handleDeleteStatus} />
        </IssuePanelContainer>
    );
};

export default AssetLogs;
