import { useMemo, useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
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

    const normalizedLogs = useMemo(() => {
        const recentLogs = (result?.recent || []).map((item: any, index: number) => ({
            id: item.id || `recent-${index}`,
            log_type: 'query_result',
            timestamp: item.timestamp || item.created_at || null,
            query_name: item.name || null,
            action: item.action || null,
            payload: item.columns || {},
            deletable: true,
        }));

        const distributedTaskLogs = (result?.queries || []).map((task: any, index: number) => ({
            id: task.id || task.guid || `distributed-${index}`,
            log_type: 'distributed_task',
            timestamp: task.timestamp || null,
            query_name: task.distributed_query?.sql || task.distributed_query?.description || null,
            status: task.status,
            results_count: Array.isArray(task.results) ? task.results.length : 0,
            payload: Array.isArray(task.results)
                ? task.results.map((r: any) => ({
                    id: r?.id,
                    timestamp: r?.timestamp,
                    columns: r?.columns,
                }))
                : [],
            deletable: false,
        }));

        return [...recentLogs, ...distributedTaskLogs].sort((a: any, b: any) => {
            const aTs = new Date(a.timestamp || 0).getTime();
            const bTs = new Date(b.timestamp || 0).getTime();
            return bTs - aTs;
        });
    }, [result]);

    return (
        <TableBuilder data={normalizedLogs} onDelete={handleDeleteStatus} />
    );
};

export default ResultLogs;
