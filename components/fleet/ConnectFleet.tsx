import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import * as Yup from 'yup';
import { Card, InputWithLabel } from '@/components/shared';
import { FleetAccount, User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import { useState } from 'react';
import { fleetV1 } from '@/lib/fleet/apiBase';

const schema = Yup.object().shape({
  email: Yup.string().required(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  fleetPassword: Yup.string().required().min(passwordPolicies.minLength),
});

const ConnectFleet = ({ user, fleetAccount }: { user: Partial<User>, fleetAccount: Partial<FleetAccount> }) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const userId = user.id;

  const formik = useFormik({
    initialValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fleetPassword: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (userId) {
          const response = await fleetV1(`/account/create`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({
              email: values.email,
              firstname: values.firstName,
              lastname: values.lastName,
              password: values.fleetPassword,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            const { id: fleetId } = data;

            // Create or update the fleet account
            const Presponse = await fetch('/api/fleet/connect', {
              method: 'POST',
              headers: defaultHeaders,
              body: JSON.stringify(
                {
                  userId,
                  fleetId,
                  accessPhrase: '',
                  connected: true,
                }
              ),
            });
            
            if (Presponse.ok) {
              window.location.reload();
            }
            
            console.log(fleetAccount);
            toast.success(t('fleet-created'));
          } else {
            throw new Error(data.message || 'Error creating fleet');
          }
        }
      } catch (error) {
        toast.error(t('fleet-connect-failed'));
      }
    },
  });

  const handleDisconnect = async () => {
    if (user.id) {
      setIsLoading(true);
      try {
        const Presponse = await fetch('/api/fleet/connect', {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify(
            {
              userId,
              fleetId: fleetAccount.fleetId,
              accessPhrase: '',
              connected: false,
            }
          ),
        });
        if (Presponse.ok) {
          window.location.reload();
        }

      } catch (error) {
        console.error('Error disconnecting fleet:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error('User ID is undefined');
    }
  };

  const handleConnet = async () => {
    const password = formik.values.fleetPassword;

    if (user.id) {
      setIsLoading(true);
      try {
        if (userId) {

          const response = await fleetV1(`/account/access`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({
              email: user.email,
              password: password,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            const fleetId = data.user.id
            const secret = data.fleet_access.secret_key
            
            const Presponse = await fetch('/api/fleet/connect', {
              method: 'POST',
              headers: defaultHeaders,
              body: JSON.stringify(
                {
                  userId,
                  fleetId,
                  accessPhrase: secret,
                  connected: true,
                }
              ),
            });

            if (Presponse.ok) {
              window.location.reload();
            }

          }
        }
      } catch (error) {
        console.error('Error disconnecting fleet:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error('User ID is undefined');
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('fleet-connect')}</Card.Title>
            <Card.Description>{t('fleet-connect-description')}</Card.Description>
          </Card.Header>
          <div className="flex flex-col space-y-3">
            {fleetAccount == null || fleetAccount.connected == false ?
              <>
                <FleetStatus/>
                <InputWithLabel
                  type="password"
                  label={t('fleet-user-password')}
                  name="fleetPassword"
                  placeholder={t('fleet-password')}
                  value={formik.values.fleetPassword}
                  error={
                    formik.touched.fleetPassword
                      ? formik.errors.fleetPassword
                      : undefined
                  }
                  onChange={formik.handleChange}
                />
                <span className='text-xs'>{t('fleet-password-description')}</span>
              </>
                :
              <>
                <FleetStatus status='connected'/>
              </>
            }
          </div>
        </Card.Body>
        <Card.Footer>
          {fleetAccount.connected==false && fleetAccount.id &&
            <>
              <Button
                type="button"
                color="success"
                loading={isLoading}
                disabled={false}
                onClick={() => handleConnet()}
                size="md"
              >
                {t('fleet-connect')}
              </Button>
            </>
          }
          {fleetAccount?.connected ? (
            <Button
              type="button"
              color="error"
              loading={isLoading}
              disabled={!fleetAccount?.connected}
              onClick={handleDisconnect}
              size="md"
            >
              {t('fleet-disconnect')}
            </Button>
          ) : (
            ''
          )}
          {fleetAccount.id == null &&
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              size="md"
            >
              {t('fleet-order-connect')}
            </Button>
          }
        </Card.Footer>
      </Card>
    </form>
  );
};

export default ConnectFleet;
