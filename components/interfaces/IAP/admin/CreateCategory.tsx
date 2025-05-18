import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { defaultHeaders } from '@/lib/common';
import { ApiResponse } from 'types';
import DaisyModal from '@/components/shared/daisyUI/DaisyModal';

const CreateIapCategory = ({
  teamSlug,
  visible,
  setVisible,
  mutate,
}: {
  teamSlug: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  mutate: () => Promise<void>;
}) => {
  const { t } = useTranslation('common');

  const onSubmit = async (formData: any) => {
    const response = await fetch(`/api/teams/${teamSlug}/iap/category`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(formData),
    });

    const json = (await response.json()) as ApiResponse<any>;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('iap-category-saved'));
    mutate();
    setVisible(false);
  };

  return (
    <DaisyModal open={visible}>
      <Form onSubmit={onSubmit}>
        {({ formProps }) => (
          <form {...formProps}>
            <DaisyModal.Header className="font-bold">
              {t('create-category-title')}
            </DaisyModal.Header>
            <DaisyModal.Body>
              <Field
                aria-required={true}
                name="name"
                label={t('category-name')}
                isRequired
              >
                {({ fieldProps }) => (
                  <TextField autoComplete="off" {...fieldProps} />
                )}
              </Field>
            </DaisyModal.Body>
            <DaisyModal.Actions>
              <AtlaskitButton
                appearance="default"
                onClick={() => setVisible(false)}
              >
                {t('close')}
              </AtlaskitButton>
              <LoadingButton type="submit" appearance="primary">
                {t('save')}
              </LoadingButton>
            </DaisyModal.Actions>
          </form>
        )}
      </Form>
    </DaisyModal>
  );
};

export default CreateIapCategory;
