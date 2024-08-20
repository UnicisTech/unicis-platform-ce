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
                {fleetAccount.id != null ? (
                    <>
                        <div className="grid grid-cols-2 items-center lg:grid-cols-2 sm:grid-cols-2 gap-4">
                            <div className="flex-1 bg-blue-100 dark:text-white dark:bg-blue-950 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
                                <h1 className="text-md font-bold">Fleet ID</h1>
                                <span className="font-sans text-sm font-bold">
                                    {fleetAccount.fleetId}
                                </span>
                            </div>
                            <div className="flex-1 bg-blue-100 dark:text-white dark:bg-blue-950 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
                                <h1 className="flex text-md font-bold justify-center items-center gap-2">
                                    Status
                                    {fleetAccount.connected ?
                                        <div className='h-2 w-2 rounded-full bg-green-500'></div>
                                        :
                                        <div className='h-2 w-2 rounded-full bg-red-500'></div>
                                    }
                                </h1>
                                <span className="font-sans text-sm font-bold">
                                    {fleetAccount.connected ?
                                        'CONNECTED'
                                        :
                                        'NOT CONNECTED'
                                    }
                                </span>
                            </div>
                            <div className="flex-1 bg-blue-100 dark:text-white dark:bg-blue-950 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
                                <h1 className="text-md font-bold">Date Created</h1>
                                <span className="font-sans text-sm font-bold">
                                    {fleetAccount.createdAt ? new Date(fleetAccount.createdAt).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex-1 bg-blue-100 dark:text-white dark:bg-blue-950 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
                                <h1 className="text-md font-bold">Date Updated Last</h1>
                                <span className="font-sans text-sm font-bold">
                                    {fleetAccount.updatedAt ? new Date(fleetAccount.updatedAt).toLocaleString() : 'N/A'}
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
