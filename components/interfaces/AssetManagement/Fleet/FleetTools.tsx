import { useTranslation } from 'next-i18next';
import { Card, CopyToClipboardButton } from '@/components/shared';
import { Button } from '@/components/shadcn/ui/button';
import { FleetTeam } from '@/types';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/common';
import { CodeBlock } from '@/components/shared/CodeBlock';

const FleetTools = ({ fleetTeam }: { fleetTeam?: FleetTeam }) => {
  const { t } = useTranslation(['common', 'fleet']);

  const endOfThisYear = new Date(
    new Date().getFullYear(),
    11,
    31
  ).toLocaleDateString();

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('fleet-tool')}</Card.Title>
          <Card.Description>{t('fleet-tool-description')}</Card.Description>
        </Card.Header>
        <div className="">
          <h1>
            {t('fleet:fleet-tls-private-key-title')}{' '}
            {t('fleet:fleet-valid-till', { date: endOfThisYear })}{' '}
            <CopyToClipboardButton value={fleetTeam?.ca_private_key} />
          </h1>
          <h1>{t('fleet:fleet-tls-certificate')}</h1>
          <CodeBlock
            language="text"
            showLineNumbers={false}
            text={fleetTeam?.ca_certificate}
          />
          <p>
            {t('fleet:fleet-ca-cert-instruction', {
              cert: './ca-cert.pem',
              ext: '.pem',
            })}
          </p>
        </div>
      </Card.Body>
      <Card.Footer>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            copyToClipboard(fleetTeam?.ca_certificate);
            toast.success(t('copied-to-clipboard'));
          }}
        >
          {t('copy')}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default FleetTools;
