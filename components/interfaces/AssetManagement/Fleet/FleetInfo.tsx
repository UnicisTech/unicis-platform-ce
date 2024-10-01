import { useTranslation } from 'next-i18next';
import { Card } from '@/components/shared';
import { User } from '@prisma/client';
import FleetStatus from './FleetStatus';


const FleetInfo = ({ user }: { user: Partial<User>}) => {
    const { t } = useTranslation('common');

    return (
        <Card>
            <Card.Body>
                <Card.Header>
                    <Card.Title>{t('fleet-info')}</Card.Title>
                    <Card.Description>{t('fleet-info-description')}</Card.Description>
                </Card.Header>
                {user?.fleetId != null ? (
                    <>
                        <div className="grid grid-cols-2 items-center lg:grid-cols-2 sm:grid-cols-2 gap-4">
                            <div className="flex-1 bg-blue-100 dark:text-white dark:bg-blue-950 ring-1 ring-gray-300 rounded-md text-center justify-center">
                                <h1 className="text-md font-bold">Fleet ID</h1>
                                <span className="font-sans text-sm font-bold">
                                    {user.fleetId}
                                </span>
                            </div>
                        </div>
                        {/* <div>
                            More
                        </div> */}
                    </>

                ) : (
                    <FleetStatus />
                )}
            </Card.Body>
        </Card>
    );
}

export default FleetInfo;
