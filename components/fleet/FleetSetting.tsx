import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Card } from '@/components/shared';
import { User, FleetAccount } from '@prisma/client';
import FleetStatus from './FleetStatus';

const FleetSetting = ({ user, fleetAccount }: { user: Partial<User>, fleetAccount: Partial<FleetAccount> }) => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      

      toast.success(t('fleet-connected'));
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
          <FleetStatus/>
        </Card.Body>
        <Card.Footer>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            disabled={false}
            size="md"
          >
            {t('fleet-settings-update')}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default FleetSetting;
