import { useTranslation } from 'next-i18next';
import { Card } from '@/components/shared';
import { FleetAccount, User } from '@prisma/client';
import FleetStatus from './FleetStatus';


const FleetInfo = ({ user, fleetAccount }: { user: Partial<User>, fleetAccount: Partial<FleetAccount> }) => {
    const { t } = useTranslation('common');

    return (
        <Card>
            <Card.Body>
                <Card.Header>
                    <Card.Title>{t('fleet-info')}</Card.Title>
                    <Card.Description>{t('fleet-info-description')}</Card.Description>
                </Card.Header>
                {fleetAccount ? (
                    <div>
                        <p>Fleet ID: {fleetAccount.fleetId}</p>
                        <p>Access Phrase: {fleetAccount.accessPhrase}</p>
                        <p>Connected: {fleetAccount.connected ? 'Yes' : 'No'}</p>
                        <p>
                            Created At: {fleetAccount.createdAt ? new Date(fleetAccount.createdAt).toLocaleString() : 'N/A'}
                        </p>
                        <p>
                            Updated A: {fleetAccount.updatedAt ? new Date(fleetAccount.updatedAt).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                ) : (
                    <FleetStatus />
                )}
            </Card.Body>
        </Card>
    );
}

export default FleetInfo;
