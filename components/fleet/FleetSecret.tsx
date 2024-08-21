import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import * as Yup from 'yup';
import { Card, CopyToClipboardButton, InputWithLabel } from '@/components/shared';
import { FleetAccount, FleetSecret as FSType, Team, User } from '@prisma/client';
import { defaultHeaders, passwordPolicies, fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';
import FleetStatus from './FleetStatus';

const schema = Yup.object().shape({
  email: Yup.string().required(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  fleetPassword: Yup.string().required().min(passwordPolicies.minLength),
});

const FleetSecret = (
  { user, fleetSecret, team, fleetAccount }
    :
  { user: Partial<User>, fleetAccount: Partial<FleetAccount>, fleetSecret: Partial<FSType>, team: Team }) => {
  const { t } = useTranslation('common');
  const userId = user.id;
  const teamFleetID = fleetSecret.fleetTeamId

  const handleOrderSecret = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not defined');
      }

      if (!teamFleetID) {
        const { fleet_team: fleetTeam, fleet_secret: fleetSecret } = await createFleetTeam(team.name, fleetAccount.accessPhrase!);
        await connectFleetSecret(team.id, fleetTeam.id, fleetSecret.secret);
        toast.success(t('fleet-created'));
      }
    } catch (error) {
      console.error('Fleet order secret error:', error);
      toast.error(t('fleet-connect-failed'));
    }
  };

  const handleDisconnect = async () => {
    if (teamFleetID) {
        await disconnectFleetSecret(team.id, fleetSecret.fleetTeamId!);
        toast.success(t('fleet-secret-disactivated'));
    }
  };

  const handleConnet = async () => {
    if (teamFleetID) {
        await connectFleetSecret(team.id, fleetSecret.fleetTeamId!, fleetSecret.secret!);
        toast.success(t('fleet-secret-activated'));
    }
  };

  const handleRenew = async () => {
    if (teamFleetID) {
      const { secret: newSecret } = await renewFleetSecret(teamFleetID, fleetAccount.accessPhrase!);
      await connectFleetSecret(team.id, fleetSecret.fleetTeamId!, newSecret);
      toast.success(t('fleet-secret-renew'));
    }
  };

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('fleet-secret')}</Card.Title>
            <Card.Description>{t('fleet-secret-description')}</Card.Description>
          </Card.Header>
          <div className="flex flex-col space-y-3">
            {fleetSecret.secret == null ?
              <>
                <FleetStatus status='no-fleet-secret' />
              </>
                :
              <>
                <FleetStatus status='connected' />
                <InputWithLabel
                  type="password"
                  label={t('fleet-secret')}
                  name="fleetPassword"
                  value={fleetSecret.secret}
                  disabled={true}
                />
              </>
            }
            {!fleetAccount.connected &&
              <FleetStatus status='access-not-granted'/>
            }
          </div>
        </Card.Body>
        <Card.Footer>
          {fleetSecret.secret != null &&
            <CopyToClipboardButton value={fleetSecret.secret!} />
          }
          {fleetSecret.active == false &&
            <>
              <Button
                type="button"
                color="success"
                loading={false}
                disabled={false}
                onClick={() => handleConnet()}
                size="md"
              >
                {t('fleet-secret-active')}
              </Button>
            </>
          }
          {fleetSecret?.active && (
            <Button
              type="button"
              color="error"
              loading={false}
              disabled={!fleetSecret?.active}
              onClick={() => handleDisconnect()}
              size="md"
            >
              {t('fleet-secret-deactivate')}
            </Button>
          )}

          {fleetSecret.id != null &&
            <Button
              type="button"
              color="primary"
              loading={false}
              disabled={!fleetAccount.connected}
              onClick={() => handleRenew()}
              size="md"
            >
              {t('fleet-renew-secret')}
            </Button>
          }
          {fleetSecret.id == null &&
            <Button
              type="button"
              color="primary"
              loading={false}
              disabled={!fleetAccount.connected}
              onClick={() => handleOrderSecret()}
              size="md"
            >
              {t('fleet-order-secret')}
            </Button>
          }
      
        </Card.Footer>
      </Card>
    </>
  );
};

const createFleetTeam = async (name: string, accessPhrase: string) => {
  const response = await fleetV1(`/team/create`, {
    method: 'POST',
    headers: fleetAuthAPIHeaders(accessPhrase),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error creating fleet team');
  }

  return response.json();
};

const renewFleetSecret = async (fleetTeamId: string, accessPhrase: string) => {
  const response = await fleetV1(`/team/${fleetTeamId}/secret`, {
    method: 'POST',
    headers: fleetAuthAPIHeaders(accessPhrase),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error creating fleet team');
  }

  return response.json();
};

const connectFleetSecret = async (teamId: string, fleetTeamId: string, secret: string) => {
  const response = await fetch('/api/fleet/secret', {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      teamId,
      fleetTeamId,
      secret,
      active: true,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to connect fleet');
  }

  return response.json();
};

const disconnectFleetSecret = async (teamId: string, fleetTeamId: string) => {
  const response = await fetch('/api/fleet/secret', {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      teamId,
      fleetTeamId,
      secret: '',
      active: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to connect fleet');
  }

  return response.json();
};

export default FleetSecret;
