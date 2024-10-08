import React from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { defaultHeaders } from '@/lib/common';
import { ApiResponse } from 'types';

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
        }

    return (
        <Modal open={visible}>
            <Form onSubmit={onSubmit}>
                {({ formProps }) => (
                    <form {...formProps}>
                        <Modal.Header className="font-bold">{t("create-category-title")}</Modal.Header>
                        <Modal.Body>
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
                        </Modal.Body>
                        <Modal.Actions>
                            <AtlaskitButton
                                appearance="default"
                                onClick={() => setVisible(false)}
                            >
                                {t('close')}
                            </AtlaskitButton>
                            <LoadingButton
                                type="submit"
                                appearance="primary"
                            >
                                {t('save')}
                            </LoadingButton>
                        </Modal.Actions>
                    </form>
                )}
            </Form>
        </Modal>
    );
};

export default CreateIapCategory;
