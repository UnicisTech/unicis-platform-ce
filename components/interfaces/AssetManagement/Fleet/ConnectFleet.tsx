import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import * as Yup from 'yup';
import { Card, InputWithLabel } from '@/components/shared';
import { User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { passwordPolicies } from '@/lib/common';
import { useState } from 'react';
import {
  useCreateFleetAccount,
  useAccessFleetAccount,
  useDisconnectFleetAccount,
  useConnectFleetAccount,
} from '@/hooks/fleets/index';

const schema = Yup.object().shape({
  email: Yup.string().required(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  fleetPassword: Yup.string().required().min(passwordPolicies.minLength),
});

const ConnectFleet = ({
  user,
}: {
    user: Partial<User>,
}) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const userId = user.id;
  
  const createFleetAccount = useCreateFleetAccount();
  const accessFleetAccount = useAccessFleetAccount();
  const disconnectFleetAccount = useDisconnectFleetAccount();
  const connectFleetAccount = useConnectFleetAccount();

  const formik = useFormik({
    initialValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fleetPassword: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const userEmail = values.email;
      const fleetPassword = values.fleetPassword;
      const lastName = values.lastName;
      const firstName = values.firstName;

      if (userEmail || lastName || firstName || fleetPassword) {
        console.error('Invalid data from user');
      }
      try {
        await createFleetAccount(userEmail!, firstName!, lastName!, fleetPassword);
        if (userId) {
          const { user, fleet_access } = await accessFleetAccount(userEmail!, fleetPassword);
      
          if (user && fleet_access) {
            const connected = await connectFleetAccount(userId, user.id, fleet_access.secret_key);
            if (connected) {
              toast.success('Connected to fleet account');
            }
          }
        }
      } catch (error) {
        console.error('Error creating or connecting fleet:', error);
      }
    },
  });

  const handleDisconnect = async () => {
    if (userId) {
      setIsLoading(true);
      const disconnect = await disconnectFleetAccount(userId);
      if (disconnect) {
        toast.success('Disconnected from fleet account');
      }
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
          
            {user.fleetAccessPhrase == null ?
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
          {user.fleetAccessPhrase ? (
            <Button
              type="button"
              color="error"
              loading={isLoading}
              disabled={!user.fleetAccessPhrase}
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
              size="md"
            >
              {t('fleet-connect')}
            </Button>
          )}
        </Card.Footer>
      </Card>
    </form>
  );
};


export default ConnectFleet;
