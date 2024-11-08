import React, { Fragment } from 'react';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import CheckboxField from '@atlaskit/checkbox';
import Form, { Field } from '@atlaskit/form';
import { type OptionsPropType } from '@atlaskit/radio/types';
import toast from 'react-hot-toast';
import { useConnectFleetSecret, useRenewFleetSecret } from '@/hooks/fleets';

interface FormData {
	[key: string]: string;
}

const options: OptionsPropType = [
	{ name: 'as', value: 'pdf', label: 'PDF File Format' },
	{ name: 'as', value: 'csv', label: 'CSV File Format' },
];

const RenewFleetSecret = ({
  visible,
  setVisible,
  fleetTeamId,
  teamId,
  fleetAccessPhrase
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
  teamId: string;
  fleetAccessPhrase: string;
}) => {
  const { t } = useTranslation('common');
  const renewFleetSecret = useRenewFleetSecret();
  const connectFleetSecret = useConnectFleetSecret();

  const handleRenew = async () => {
    if (fleetTeamId) {
      const { secret: newSecret } = await renewFleetSecret(fleetTeamId!, fleetAccessPhrase as string);
      const saved = await connectFleetSecret(teamId, fleetTeamId!, newSecret);
      console.log(saved);
      toast.success(t('fleet-secret-renew'));
    }
  };

  return (
    <Modal open={visible}>
      <Form<FormData>
			onSubmit={ async (data) => {
          console.log('form data', data);
          await handleRenew();
			}}
		>
			{({ formProps }) => (
        <form {...formProps}>
          <Modal.Header className="font-bold">{`Confirm Fleet Secret Renew`}</Modal.Header><Modal.Body>
          
          <Field
            aria-required={false}
            name="confirm_fleet_secret_renew"
            label={t('I confirm that I want to renew the Fleet Secret')}
            isRequired
          >
            {({ fieldProps }) => (
              <Fragment>
                <CheckboxField autoComplete="off" {...fieldProps} />
              </Fragment>
            )}
          </Field>

          <span className='text-xs'>{t('fleet-renew-node-description')}</span>
          </Modal.Body><Modal.Actions>
            <Button
              type="submit"
              color="primary"
            >
              {t('Renew')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setVisible(!visible);
              } }
            >
              {t('close')}
            </Button>
          </Modal.Actions>
        </form>
      )}
		</Form>
  </Modal>
  );
};

export default RenewFleetSecret;
