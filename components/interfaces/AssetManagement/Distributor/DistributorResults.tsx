import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import { useGetDistributedIdResult } from '@/hooks/fleets/distributors/useGetDistributorIdResult';
import TableBuilder from '../TableBuilder';
import { useDeleteDistributedResult } from '@/hooks/fleets/distributors/useDeleteDistributorResult';


const DistributorsResults = ({ user, distributorId, fleetTeamId }: { user: Partial<User>, distributorId: string, fleetTeamId: string }) => {
    const { t } = useTranslation('common');
    const { canAccess } = useCanAccess();
    const [status, setStatus] = useState<'new' | 'pending' | 'complete' | 'failed'>('new');
    const [result, setResultToDelete] = useState<string>();
    const [deleteVisible, setDeleteVisible] = useState(false);
    const deleteResult = useDeleteDistributedResult()

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

    const handleDeleteResult = async (id: string) => {
        await deleteResult(fleetTeamId, distributorId, id)
        mutateDistributorResult();
        setResultToDelete(id)
    };

    return (
        <IssuePanelContainer>
            <TableBuilder data={distributorsResult?.results!} onDelete={handleDeleteResult} />
        </IssuePanelContainer>
    );
};

export default DistributorsResults;
