import { useTranslation } from 'next-i18next';
import { Card, CopyToClipboardButton } from '@/components/shared';
import { Button } from 'react-daisyui';
import { FleetTeam } from '@/types';
import { CodeBlock } from '@atlaskit/code';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/common';

const FleetTools = ({ fleetTeam }: { fleetTeam?: FleetTeam}) => {
    const { t } = useTranslation('common');

    const endOfThisYear = new Date(new Date().getFullYear(), 11, 31).toLocaleDateString();
    
    return (
        <Card>
            <Card.Body>
                <Card.Header>
                    <Card.Title>{t('fleet-tool')}</Card.Title>
                    <Card.Description>{t('fleet-tool-description')}</Card.Description>
                </Card.Header>
                <div className=''>
                    <h1>Team TLS Certificate Private Key {`Valid till ${endOfThisYear}`} <CopyToClipboardButton value={fleetTeam?.ca_private_key} /></h1>
                    <h1>Team TLS Certificate</h1>
                    <CodeBlock language="text" showLineNumbers={false} text={fleetTeam?.ca_certificate} />
                    <p>Save the CA content in <span className='text-green-500'>./ca-cert.pem</span> or any name with <span className='text-green-500'>.pem</span> extension</p>
                </div>
            </Card.Body>
            <Card.Footer>
            <Button
                type="button"
                size="md"
                onClick={() => {
                    copyToClipboard(fleetTeam?.ca_certificate);
                    toast.success(t('copied-to-clipboard'));
                }
                }
            >
              {t('copy')}
            </Button>
        </Card.Footer>
        </Card>
    );
}

export default FleetTools;
