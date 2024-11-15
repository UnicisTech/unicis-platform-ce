import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import { useAssetActivities } from '@/hooks/fleets/Nodes';
import TableBuilder from '../../TableBuilder';
import { useDeleteAssetResultLog } from '@/hooks/fleets/Nodes/useDeleteResult';


const ResultLogs = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {

    const [resultToDelete, setResultToDelete] = useState<string>();
    const deleteLog = useDeleteAssetResultLog();

    const { result, isLoading, isError, mutateAssetActivities } = useAssetActivities(fleetTeamId, nodeID);

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
        setResultToDelete(id);
        mutateAssetActivities();
    };

    return (
        <IssuePanelContainer>
            <TableBuilder data={result?.recent} onDelete={handleDeleteStatus} />
        </IssuePanelContainer>
    );
};

export default ResultLogs;
