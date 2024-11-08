import { useTranslation } from 'next-i18next';
import { Card, CopyToClipboardButton } from '@/components/shared';
import { Team } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { CodeBlock } from '@atlaskit/code';
import { OSQUERY_ENTRY } from '@/lib/fleet/tools';
import env from '@/lib/env';


const FleetHelper = ({ team, safe=true }: { team: Partial<Team>, safe?: boolean}) => {
    const { t } = useTranslation('common');
    const OsqueryEntry = OSQUERY_ENTRY({ secret: team.fleetSecret!, teamName: team.name!, apiUrl: env.fleetAPI, safe: safe });
    
    return (
        <Card>
            <Card.Body>
                <Card.Header>
                    <Card.Title>{t('fleet-info')}</Card.Title>
                    <Card.Description>{t('fleet-info-description')}</Card.Description>
                </Card.Header>
                {team?.fleetSecret != null ? (
                    <div>
                        <CopyToClipboardButton value={OSQUERY_ENTRY({ secret: team.fleetSecret!, teamName: team.name!, apiUrl: env.fleetAPI, safe: safe, isCopy: true })!} />
                        <CodeBlock
                            language="sh"
                            codeBidiWarningTooltipEnabled
                            codeBidiWarnings
                            codeBidiWarningLabel='Fleet Osquery Demon'
                            shouldWrapLongLines={true} showLineNumbers={true}
                            text={OsqueryEntry}
                        />
                    </div>
                ) : (
                    <FleetStatus />
                )}
            </Card.Body>
        </Card>
    );
}

export default FleetHelper;
