import { useTranslation } from 'next-i18next';
import { Card } from '@/components/shared';
import { Team } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { CodeBlock } from '@atlaskit/code';
import { OSQUERY_ENTRY } from '@/lib/fleet/tools';
import env from '@/lib/env';


const FleetHelper = ({ team }: { team: Partial<Team>}) => {
    const { t } = useTranslation('common');

    return (
        <Card>
            <Card.Body>
                <Card.Header>
                    <Card.Title>{t('fleet-info')}</Card.Title>
                    <Card.Description>{t('fleet-info-description')}</Card.Description>
                </Card.Header>
                {team?.fleetSecret != null ? (
                    <div>
                        <CodeBlock
                            language="sh"
                            codeBidiWarningTooltipEnabled
                            codeBidiWarnings
                            codeBidiWarningLabel='Fleet Osquery Demon'
                            shouldWrapLongLines={true} showLineNumbers={true}
                            text={OSQUERY_ENTRY({ secret: team.fleetSecret, teamName: team.name, apiUrl: env.fleetAPIUrl})}
                        />
                        <span>For more Information visit <a className='text-blue-600' href="https://osquery.readthedocs.io/en/stable/installation/cli-flags/">Command Line Flags</a></span>
                    </div>
                ) : (
                    <FleetStatus />
                )}
            </Card.Body>
        </Card>
    );
}

export default FleetHelper;
