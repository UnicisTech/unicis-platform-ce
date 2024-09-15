import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Card, CopyToClipboardButton, InputWithLabel } from '@/components/shared';
import { Team, User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { useConnectFleetSecret, useCreateFleetTeam, useDisconnectFleetSecret, useRenewFleetSecret } from '@/hooks/fleets';
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


const FleetSecret = (
  {
    user,
    team
  }: {
    user: Partial<User>,
    team: Team
  }) => {
  const { t } = useTranslation('common');
  const userId = user.id;
  const teamId = team.id;
  
  const createFleetTeam = useCreateFleetTeam();
  const connectFleetSecret = useConnectFleetSecret();
  const disconnectFleetSecret = useDisconnectFleetSecret();
  const renewFleetSecret = useRenewFleetSecret();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  const handleDisconnect = async () => {
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

  const handleRenew = async () => {
    if (team.fleetTeamId!) {
      const { secret: newSecret } = await renewFleetSecret(team.fleetTeamId!, user.fleetAccessPhrase as string);
      const saved = await connectFleetSecret(teamId, team.fleetTeamId!, newSecret);
      console.log(saved);
      toast.success(t('fleet-secret-renew'));
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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
                type={isPasswordVisible ? "text" : "password"}
                label={t('fleet-secret')}
                name="fleetPassword"
                value={team.fleetSecret!}
                disabled={true}
              />
              <button
                  type="button"
                  className="absolute right-2 top-9 transform -translate-y-1/2"
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
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
            color="success"
            loading={false}
            disabled={team.fleetSecret! === null}
            onClick={handleConnect}
            size="md"
          >
            {t('fleet-secret-active')}
          </Button>
        }
        <Button
          type="button"
          color="primary"
          loading={false}
          disabled={team.fleetSecret! === null}
          onClick={handleRenew}
          size="md"
        >
          {t('fleet-renew-secret')}
        </Button>
        {team.fleetSecret! === null ?
          <Button
            type="button"
            color="primary"
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
            color="error"
            loading={false}
            disabled={!team.fleetSecret! || !user?.fleetAccessPhrase}
            onClick={handleDisconnect}
            size="md"
          >
            {t('fleet-secret-deactivate')}
          </Button>
        }
      </Card.Footer>
    </Card>
  );
};

export default FleetSecret;
