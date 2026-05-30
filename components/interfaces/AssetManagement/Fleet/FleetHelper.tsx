import { useTranslation } from 'next-i18next';
import { Card } from '@/components/shared';
import { Team } from '@/generated/client';
import FleetStatus from './FleetStatus';


const FleetHelper = ({ team, safe=true }: { team: Partial<Team>, safe?: boolean}) => {
    const { t } = useTranslation(['common', 'fleet']);
    
    return (
        <Card>
            <Card.Body>
                <Card.Header>
                    <Card.Title>{t('fleet:fleet-info')}</Card.Title>
                    <Card.Description>{t('fleet:fleet-info-description')}</Card.Description>
                </Card.Header>
                {team != null ? (
                    <div>

                    </div>
                ) : (
                    <FleetStatus />
                )}
            </Card.Body>
        </Card>
    );
}

export default FleetHelper;
