import { useTranslation } from 'next-i18next';


type FleetStatusProps = {
  status?: 'connected' | 'disconnected' | 'not-found';
};

const FleetStatus: React.FC<FleetStatusProps> = ({ status }) => {
    const { t } = useTranslation('common');


    return (
        <div className="flex gap-6 flex-col">
            {status === 'connected' && (
                <div>
                    {t('fleet-connected')}
                </div>
            )}
            {status === 'disconnected' && (
                <div>
                    {t('fleet-disconnected')}
                </div>
            )}
            {status === 'not-found' && (
                <div>
                    {t('fleet-not-found')}
                </div>
            )}
            {!status && (
                <div>
                    {t('fleet-not-connected')}
                </div>
            )}
        </div>
    );
};

export default FleetStatus;
