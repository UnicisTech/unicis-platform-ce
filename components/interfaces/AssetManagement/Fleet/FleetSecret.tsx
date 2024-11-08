import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Card, CopyToClipboardButton, InputWithLabel } from '@/components/shared';
import { Team, User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { useConnectFleetSecret, useCreateFleetTeam, useDisconnectFleetSecret } from '@/hooks/fleets';
import { useState } from 'react';
import RenewFleetSecret from './RenewFleetSecret';
import useCanAccess from '@/hooks/useCanAccess';


const FleetSecret = (
  {
    user,
    team,
    safe = true
  }: {
    user: Partial<User>,
      team: Team,
    safe?: boolean
  }) => {
  const { t } = useTranslation('common');
  const userId = user.id;
  const teamId = team.id;
  
  const createFleetTeam = useCreateFleetTeam();
  const connectFleetSecret = useConnectFleetSecret();
  const disconnectFleetSecret = useDisconnectFleetSecret();
  const [renewVisible, setRenewVisible] = useState(false);

  const { canAccess } = useCanAccess();

  const handleOrderSecret = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not defined');
      }

      if (!team.fleetSecret) {
        const fleetTeam = await createFleetTeam(team.name, user.fleetAccessPhrase as string);
        const saved = await connectFleetSecret(teamId, fleetTeam.id, fleetTeam.secret.secret);
        console.log(saved);
        toast.success(t('fleet-created'));
      }
    } catch (error) {
      console.error('Fleet order secret error:', error);
      toast.error(t('fleet-connect-failed'));
    }
  };

  const handleReset = async () => {
    if (team.fleetTeamId!) {
      await disconnectFleetSecret(teamId);
      toast.success(t('fleet-secret-disactivated'));
    }
  };

  const handleConnect = async () => {
    if (team.fleetTeamId!) {
      await connectFleetSecret(teamId, team.fleetTeamId!, team.fleetSecret!);
      toast.success(t('fleet-secret-activated'));
    }
  };

  const openRenewModal = () => {
    setRenewVisible(true);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('fleet-secret')}</Card.Title>
          <Card.Description>{t('fleet-secret-description')}</Card.Description>
        </Card.Header>
        <div className="flex flex-col space-y-3">
            {!user.fleetAccessPhrase ?
              <FleetStatus status='access-not-granted'/>
              :
            <>
              <FleetStatus status='connected' />
              <InputWithLabel
                type={safe ? "password" : "text"}
                label={t('fleet-secret')}
                name="fleetPassword"
                value={team.fleetSecret!}
                disabled={true}
              />
              {team.fleetSecret! != null &&
                <div>
                  <CopyToClipboardButton value={team.fleetSecret!} />
                </div>
              }
            </>
          }
          {team.fleetSecret! == null &&
            <FleetStatus status='no-fleet-secret' />
          }
        </div>
      </Card.Body>
      <Card.Footer>
        {team.fleetSecret == null &&
          <Button
            type="button"
            loading={false}
            disabled={team.fleetSecret! === null}
            onClick={handleConnect}
            size="md"
          >
            {t('fleet-secret-active')}
          </Button>
        }
        {canAccess('team_fleet_node', ['delete']) && (
          <Button
            type="button"
            loading={false}
            size="md"
            onClick={() => {
              openRenewModal();
            }}
          >
            {t('fleet-renew-secret')}
          </Button>
        )}
        {team.fleetSecret! === null ?
          <Button
            type="button"
            loading={false}
            disabled={team.fleetSecret! !== null}
            onClick={handleOrderSecret}
            size="md"
          >
            {t('fleet-order-secret')}
          </Button>
          :
          <Button
            type="button"
            loading={false}
            disabled={!team.fleetSecret! || !user?.fleetAccessPhrase}
            onClick={handleReset}
            size="md"
          >
            {t('fleet-secret-reset')}
          </Button>
        }
      </Card.Footer>
      <RenewFleetSecret
        teamId={teamId}
        fleetTeamId={team.fleetTeamId!}
        fleetAccessPhrase={user.fleetAccessPhrase!}
        setVisible={setRenewVisible}
        visible={renewVisible}
      />
    </Card>
  );
};

export default FleetSecret;
