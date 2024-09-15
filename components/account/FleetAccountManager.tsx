import type { User } from '@prisma/client';
import ConnectFleet from '../interfaces/Fleet/ConnectFleet';
import { FleetInfo } from '../interfaces/Fleet';
import AccountTab from './AccountTab';
import FleetAccountTab from './FleetAccountTab';
import { useState } from 'react';

interface FleetAccountProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const FleetAccountManager = ({ user, allowEmailChange }: FleetAccountProps) => {
    const [activeTab, setActiveTab] = useState('Connect');

    return (
        <div>
            <AccountTab activeTab="fleet" user={user}/>
            <FleetAccountTab activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === 'Connect' && (
                <>
                    <ConnectFleet user={user} />
                    <FleetInfo user={user} />
                </>
            )}
            {activeTab === 'Webhook' && (
                <>
                    Webhook
                </>
            )}
        </div>
    );
};

export default FleetAccountManager;
