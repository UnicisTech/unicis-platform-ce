import React, { Fragment, useRef } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import type { User } from '@prisma/client';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { Field, FormFooter } from '@atlaskit/form';
import 'react-quill/dist/quill.snow.css';
import { useCreateTag } from '@/hooks/fleets/Tags/useCreateTag';


interface FormData {
  values;
}

const CreateTag = ({
  visible,
  setVisible,
  user,
  fleetTeamId
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  user: Partial<User>;
  fleetTeamId: string;
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const createTag = useCreateTag();
  const { t } = useTranslation('common');

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">Create Tag</Modal.Header>
      <Form<FormData>
        onSubmit={async (data, { reset }) => {
          const { values } = data;
          const packData = {values};
          try {
            await createTag(fleetTeamId, packData, user?.fleetAccessPhrase!);
            toast.success(t('success-creating-tag'));
          } catch (err) {
            toast.error(t('error-creating-tag'));
          };
        }}
      >
        {({ formProps, submitting }) => (
          <form
            {...formProps}
            ref={formRef}
            className="flex flex-col justify-between"
            style={{ height: '92%' }}
          >
            <Modal.Body>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  margin: '0 auto',
                  flexDirection: 'column',
                }}
              >
                <Field
                  aria-required={true}
                  name="values"
                  label="Values"
                  isRequired
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                <FormFooter></FormFooter>
              </div>
            </Modal.Body>
            <Modal.Actions>
              <Button
                appearance="default"
                onClick={() => {
                  setVisible(!visible);
                }}
              >
                {t('close')}
              </Button>
              <LoadingButton
                type="submit"
                appearance="primary"
                ref={submitButtonRef}
                isLoading={submitting}
              >
                {t('create')}
              </LoadingButton>
            </Modal.Actions>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default CreateTag;
