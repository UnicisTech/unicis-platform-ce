import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Card, CopyToClipboardButton, InputWithLabel } from '@/components/shared';
import { FleetAccount, FleetSecret as FSType, Team, User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { useConnectFleetSecret, useCreateFleetTeam, useDisconnectFleetSecret, useRenewFleetSecret } from '@/hooks/fleets';
import { getFleetSecret } from '@/hooks/fleets/useFleetSecret';
import { useEffect, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


const FleetSecret = (
  {
    user,
    team,
    fleetAccount
  }:{
    user: Partial<User>,
    fleetAccount: Partial<FleetAccount>,
    team: Team
  }) => {
  const { t } = useTranslation('common');
  const userId = user.id;
  const teamId = team.id;
  
  const createFleetTeam = useCreateFleetTeam();
  const connectFleetSecret = useConnectFleetSecret();
  const disconnectFleetSecret = useDisconnectFleetSecret();
  const renewFleetSecret = useRenewFleetSecret();
  
  const [fleetSecret, setFleetSecret] = useState<Partial<FSType> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);


  useEffect(() => {
    const fetchSecret = async () => {
      try {
        const secret = await getFleetSecret(teamId);
        setFleetSecret(secret);
      } catch (error) {
        setIsError('error.message');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecret();
  }, [teamId]);

  if (isLoading) return <div>{t('loading')}</div>;

  const handleOrderSecret = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not defined');
      }

      if (!fleetSecret) {
        const fleetTeam = await createFleetTeam(team.name, fleetAccount.accessPhrase!);
        const saved = await connectFleetSecret(teamId, fleetTeam.id, fleetTeam.secret.secret);
        console.log(saved);
        toast.success(t('fleet-created'));
        setFleetSecret(saved);  // Update the state with the newly created fleet secret
      }
    } catch (error) {
      console.error('Fleet order secret error:', error);
      toast.error(t('fleet-connect-failed'));
    }
  };

  const handleDisconnect = async () => {
    if (fleetSecret?.fleetTeamId) {
      await disconnectFleetSecret(teamId, fleetSecret.fleetTeamId);
      toast.success(t('fleet-secret-disactivated'));
      setFleetSecret(null);  // Reset the fleet secret state
    }
  };

  const handleConnect = async () => {
    if (fleetSecret?.fleetTeamId) {
      await connectFleetSecret(teamId, fleetSecret.fleetTeamId, fleetSecret.secret!);
      toast.success(t('fleet-secret-activated'));
    }
  };

  const handleRenew = async () => {
    if (fleetSecret?.fleetTeamId) {
      const { secret: newSecret } = await renewFleetSecret(fleetSecret.fleetTeamId, fleetAccount.accessPhrase!);
      const saved = await connectFleetSecret(teamId, fleetSecret.fleetTeamId, newSecret);
      console.log(saved);
      toast.success(t('fleet-secret-renew'));
      setFleetSecret(saved);  // Update the state with the renewed secret
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
            {!fleetAccount?.connected ?
              <FleetStatus status='access-not-granted'/>
              :
            <>
              <FleetStatus status='connected' />
              <InputWithLabel
                type={isPasswordVisible ? "text" : "password"}
                label={t('fleet-secret')}
                name="fleetPassword"
                value={fleetSecret?.secret}
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
              {fleetSecret?.secret != null &&
                <div>
                  <CopyToClipboardButton value={fleetSecret.secret!} />
                </div>
              }
            </>
          }
          {fleetSecret?.secret == null &&
            <FleetStatus status='no-fleet-secret' />
          }
        </div>
      </Card.Body>
      <Card.Footer>
        {fleetSecret?.active == false &&
          <Button
            type="button"
            color="success"
            loading={false}
            disabled={false}
            onClick={handleConnect}
            size="md"
          >
            {t('fleet-secret-active')}
          </Button>
        }
        {fleetSecret?.active && (
          <Button
            type="button"
            color="error"
            loading={false}
            disabled={!fleetSecret?.active || !fleetAccount?.connected}
            onClick={handleDisconnect}
            size="md"
          >
            {t('fleet-secret-deactivate')}
          </Button>
        )}
        {fleetSecret?.id != null &&
          <Button
            type="button"
            color="primary"
            loading={false}
            disabled={!fleetAccount?.connected}
            onClick={handleRenew}
            size="md"
          >
            {t('fleet-renew-secret')}
          </Button>
        }
        {fleetSecret?.id == null &&
          <Button
            type="button"
            color="primary"
            loading={false}
            disabled={!fleetAccount?.connected}
            onClick={handleOrderSecret}
            size="md"
          >
            {t('fleet-order-secret')}
          </Button>
        }
      </Card.Footer>
    </Card>
  );
};

export default FleetSecret;
