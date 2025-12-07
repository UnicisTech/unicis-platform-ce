import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
// import { IssuePanelContainer } from '@/sharedStyles';
import { useAssetConfig } from '@/hooks/fleets/Nodes';
import { CodeBlock } from '@/components/shared/CodeBlock';


const AssetConfig = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {

    const [resultToDelete, setResultToDelete] = useState<string>();

    const { config, isLoading, isError } = useAssetConfig(fleetTeamId, nodeID);

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
        setResultToDelete(id)
    };

    return (
        // <IssuePanelContainer>
            <CodeBlock language="JSON" shouldWrapLongLines i18nIsDynamicList={true} showLineNumbers={false} text={JSON.stringify(config)} />
        // </IssuePanelContainer>
    );
};

export default AssetConfig;
