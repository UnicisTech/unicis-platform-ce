import React, { Fragment, useRef } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { Field, FormFooter } from '@atlaskit/form';
import 'react-quill/dist/quill.snow.css';
import { Tag } from '@/types/fleet';
import { useUpdateTag } from '@/hooks/fleets/Tags/useUpdateTag';
import { useTags } from '@/hooks/fleets/Tags/useTags';


interface FormData {
    value: string;
}

const EditTag = ({
    visible,
    setVisible,
    tag,
    fleetTeamId
}: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    tag: Tag;
    fleetTeamId: string;
}) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const submitButtonRef = useRef<HTMLButtonElement | null>(null);
    const updateTag = useUpdateTag();
    const { t } = useTranslation('common');
    const { mutateTags } = useTags(fleetTeamId);

    return (
        <Modal open={visible}>
            <Modal.Header className="font-bold">Edit Tag</Modal.Header>
            <Form<FormData>
                onSubmit={async (data, { reset }) => {
                    const { value } = data;
                    const tagData = { value };
                    try {
                        await updateTag(fleetTeamId, tagData, tag.id);
                        toast.success(t('success'));
                        mutateTags();
                        setVisible(false);
                    } catch (err) {
                        toast.error(t('error'));
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
                                    name="value"
                                    label="Tag Value"
                                    defaultValue={tag.value}
                                    isRequired
                                >
                                    {({ fieldProps }) => (
                                        <Fragment>
                                            <TextField {...fieldProps} />
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
                                {t('update')}
                            </LoadingButton>
                        </Modal.Actions>
                    </form>
                )}
            </Form>
        </Modal>
    );
};

export default EditTag;
