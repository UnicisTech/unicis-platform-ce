import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import * as Yup from 'yup';
import { Card } from '@/components/shared';
import { User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { passwordPolicies } from '@/lib/common';

const schema = Yup.object().shape({
  id: Yup.string().required(),
  email: Yup.string().required(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  fleetPassword: Yup.string().required().min(passwordPolicies.minLength),
});

const SettingsFleet = ({
  user,
}: {
    user: Partial<User>,
}) => {
  const { t } = useTranslation('common');
  

  const formik = useFormik({
    initialValues: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fleetPassword: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const userId = values.id;
      const userEmail = values.email;
      const fleetPassword = values.fleetPassword;
      const lastName = values.lastName;
      const firstName = values.firstName;

      if (userId || userEmail || lastName || firstName || fleetPassword) {
        console.error('Invalid data from user');
        return;
      }
      try {
      
      } catch (error) {
        console.error('Error creating or connecting fleet:', error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('fleet-settings')}</Card.Title>
            <Card.Description>{t('fleet-settings-description')}</Card.Description>
          </Card.Header>
          <div className="flex flex-col space-y-3">

            {user &&
              <>
                <FleetStatus status='connected' />
              </>
            }
          </div>
        </Card.Body>
        <Card.Footer>
          {user &&
            <Button
              type="button"
              size="md"
              onClick={() => { }}
            >
              {t('disconnect')}
            </Button>
          }
          {user &&
            <Button
              type="submit"
              size="md"
            >
              {t('save')}
            </Button>
          }
        </Card.Footer>
      </Card>
    </form>
  );
};


export default SettingsFleet;
