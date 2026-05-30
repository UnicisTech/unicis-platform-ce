import { useTranslation } from 'next-i18next';


type FleetStatusProps = {
  status?: 'connected' | 'disconnected' | 'not-found' | 'no-fleet-secret' | 'access-not-granted';
};

const FleetStatus: React.FC<FleetStatusProps> = ({ status }) => {
    const { t } = useTranslation(['common', 'fleet']);


    return (
        <div className="flex gap-6 flex-col text-xl">
            {status === 'connected' && (
                <div className='text-green-500'>
                    {t('fleet:fleet-connected')}
                </div>
            )}
            {status === 'disconnected' && (
                <div className='text-yellow-500'>
                    {t('fleet:fleet-disconnected')}
                </div>
            )}
            {status === 'not-found' && (
                <div className='text-orange-500'>
                    {t('fleet:fleet-not-found')}
                </div>
            )}
            {status === 'no-fleet-secret' && (
                <div className='text-red-500'>
                    {t('fleet:fleet-secret-not-found')}
                </div>
            )}
            {status === 'access-not-granted' && (
                <div className='text-red-500'>
                    {t('fleet:fleet-access-not-granted')}
                </div>
            )}
            {!status && (
                <div className='text-red-500'>
                    {t('fleet:fleet-not-connected')}
                </div>
            )}
        </div>
    );
};

export default FleetStatus;
