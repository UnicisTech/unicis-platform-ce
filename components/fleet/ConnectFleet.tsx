import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import * as Yup from 'yup';
import { Card, InputWithLabel } from '@/components/shared';
import { FleetAccount, User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { disconnectFleet } from 'models/fleet';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import axios from 'axios';
import { useState } from 'react';
import env from '@/lib/env';


const schema = Yup.object().shape({
  email: Yup.string().required(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  newPassword: Yup.string().required().min(passwordPolicies.minLength),
});

const ConnectFleet = ({ user, fleetAccount }: { user: Partial<User>, fleetAccount: Partial<FleetAccount> }) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);

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
        console.log(process.env.FLEET_APP_URL)

        const response = await axios.post(`${env.fleetAPIUrl}/api/v1/account/create`, {
          email: values.email,
          firstname: values.firstName,
          lastname: values.lastName,
          password: values.fleetPassword,
        });

        if (response.status === 201) {
          const { access_phrase, fleet_id } = response.data;

          if (!access_phrase) {
            throw new Error('Access phrase not received');
          }

          const connectResponse = await fetch('/api/fleet/connect', {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({
              userId: user.id,
              fleetId: fleet_id,
              accessPhrase: access_phrase,
            }),
          });

          if (connectResponse.ok) {
            toast.success(t('fleet-connected'));
          } else {
            throw new Error('Failed to connect to fleet');
          }

        } else {
          toast.error(t('fleet-connect-failed'));
        }
      } catch (error) {
        toast.error(t('fleet-connect-failed'));
        console.error('Error connecting fleet:', error);
      }
    },
  });

  const handleDisconnect = async () => {
    if (user.id) {
      setIsLoading(true);
      try {
        await disconnectFleet(user.id);
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
            {fleetAccount == null ?
              <>
                <FleetStatus/>
                <InputWithLabel
                  type="password"
                  label={t('fleet-set-password')}
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
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              disabled={fleetAccount?.connected}
              size="md"
            >
              {t('fleet-order-connect')}
            </Button>
          )}
        </Card.Footer>
      </Card>
    </form>
  );
};

export default ConnectFleet;
