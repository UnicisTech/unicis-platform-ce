import React, { Fragment } from 'react';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import CheckboxField from '@atlaskit/checkbox';
import { RadioGroup } from '@atlaskit/radio';
import Form, { ErrorMessage, Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { type OptionsPropType } from '@atlaskit/radio/types';

interface FormData {
	[key: string]: string;
	'as': string;
}

const validateOnSubmit = (data: FormData) => {
	let errors;
	errors = requiredValidator(data, 'as-file');
	return errors;
};

const requiredValidator = (data: FormData, key: string) => {
	if (data[key] === 'invalid') {
		return {
			[key]: `This field is invalid.`,
		};
	}
};

const options: OptionsPropType = [
	{ name: 'as', value: 'pdf', label: 'PDF File Format' },
	{ name: 'as', value: 'csv', label: 'CSV File Format' },
];

const ExportNode = ({
  nodeId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  nodeId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal open={visible}>
      <Form<FormData>
			onSubmit={(data) => {
				console.log('form data', data);
				return Promise.resolve(validateOnSubmit(data));
			}}
		>
			{({ formProps }) => (
        <form {...formProps}>
          <Modal.Header className="font-bold">{`Export Node`}</Modal.Header><Modal.Body>
          <Field
            aria-required={false}
            name="name"
                label={t('Save As (Default to Node ID)')}
                defaultValue={nodeId}
            isRequired
          >
            {({ fieldProps }) => (
              <Fragment>
                <TextField autoComplete="off" {...fieldProps} />
              </Fragment>
            )}
          </Field>
              <Field
                aria-required={false}
              label="Export As PDF or CSV Documents"
              name="as"
              defaultValue="pdf"
                isRequired
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <RadioGroup {...fieldProps} options={options} />
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                </Fragment>
              )}
            </Field>
          <Field
            aria-required={false}
            name="relatives"
            label={t('Include Relatives [Query,Pack,Node Config, Distributor] and Results')}
          >
            {({ fieldProps }) => (
              <Fragment>
                <CheckboxField autoComplete="off" {...fieldProps} />
              </Fragment>
            )}
          </Field>

          <span className='text-xs'>{t('fleet-export-node-description')}</span>
          </Modal.Body><Modal.Actions>
            <Button
              type="submit"
              color="primary"
            >
              {t('export')}
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

export default ExportNode;
