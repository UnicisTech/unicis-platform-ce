import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import * as Yup from 'yup';
import { Card, InputWithLabel } from '@/components/shared';
import { FleetAccount, FleetSecret as FSType, Team, User } from '@prisma/client';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const userId = user.id;

  const handleOrderSecret = async () => {
    try {
        if (userId) {
          const response = await fleetV1(`/team/create`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({
              teamId: team.id,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            const { id: fleetTeamId, secret } = data;

            // Create or update the fleet account
            const Presponse = await fetch('/api/fleet/secret', {
              method: 'POST',
              headers: defaultHeaders,
              body: JSON.stringify(
                {
                  teamId: team.id,
                  fleetTeamId: fleetTeamId,
                  secret: secret,
                  connected: true,
                }
              ),
            });
            
            if (Presponse.ok) {
              window.location.reload();
            }
            
            console.log(fleetSecret);
            toast.success(t('fleet-created'));
          } else {
            throw new Error(data.message || 'Error creating fleet');
          }
        }
      } catch (error) {
        toast.error(t('fleet-connect-failed'));
      }
  }

  const handleDisconnect = async () => {
    
  };

  const handleConnet = async () => {
    await fleetV1(`/team/create`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        teamId: team.id,
      }),
    });
   
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
                <FleetStatus status='no-fleet-secret'/>
              </>
                :
              <>
                <FleetStatus status='connected'/>
              </>
            }
            {!fleetAccount.connected &&
            <FleetStatus status='access-not-granted'/>
            }
          </div>
        </Card.Body>
        <Card.Footer>
          {fleetSecret.active == false &&
            <>
              <Button
                type="button"
                color="success"
                loading={isLoading}
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
              loading={isLoading}
              disabled={!fleetSecret?.active}
              onClick={() => handleDisconnect()}
              size="md"
            >
              {t('fleet-secret-deactivate')}
            </Button>
          )}

          {fleetSecret.id == null &&
            <Button
              type="button"
              color="primary"
              loading={isLoading}
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

export default FleetSecret;
