import React, { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';

interface CreateRiskProps {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>
}

const CreateRisk = ({ visible, setVisible }: CreateRiskProps) => {
    const { t } = useTranslation('common');

    // stage 0 - task selection
    // stage 1 - impact form
    // stage 2 - treatment form
    const [stage, setStage] = useState<number>(0)

    const onSubmit = () => { }

    return (
        <Modal open={visible}>
            <Form onSubmit={onSubmit}>
                {({ formProps }) => (
                    <form {...formProps}>
                        <Modal.Header className="font-bold">Header</Modal.Header>
                        <Modal.Body>
                            {/* #35 Form fields, like /components/interfaces/TIA/CreateFormBody.tsx or /components/interfaces/RPA/CreateFormBody.tsx */}
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
                                {stage < 2 ? t('next') : t('save')}
                            </LoadingButton>
                        </Modal.Actions>
                    </form>
                )}
            </Form>
        </Modal>
    )
}

export default CreateRisk