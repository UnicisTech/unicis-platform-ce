import React, { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import { RadioGroup } from '@atlaskit/radio';
import Form, {
    ErrorMessage,
    Field,
    FieldProps,
    CheckboxField,
    FormFooter,
    HelperMessage,
} from '@atlaskit/form';
import TextArea from '@atlaskit/textarea';
import { fieldPropsMapping, config } from '@/components/defaultLanding/data/configs/pia';
import { TaskPickerFormBody } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';


interface CreateRiskProps {
    tasks: Task[];
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>
}

const CreateRisk = ({ tasks, visible, setVisible }: CreateRiskProps) => {
    const { t } = useTranslation('common');

    const [stage, setStage] = useState<number>(0)
    const [task, setTask] = useState<Task | null>(null);

    const onSubmit = (formData: any) => {
        console.log('onSubmit formData', { formData, stage });

        switch (stage) {
            case 0: {
                const task = formData.task.value;
                setTask(task);
                setStage(1);
                break;
            }
            case 1:
            case 2:
            case 3:
            case 4: {
                // TODO: Saving logic for stages 1, 2, and 3
                setStage(stage + 1);
                break;
            }
            default: {
                console.warn('Unexpected stage:', stage);
                break;
            }
        }
    };


    return (
        <Modal open={visible}>
            <Form onSubmit={onSubmit}>
                {({ formProps }) => (
                    <form {...formProps}>
                        <Modal.Header className="font-bold">Header</Modal.Header>
                        <Modal.Body>
                            {stage === 0 && <TaskPickerFormBody tasks={tasks} />}
                            {stage === 1 && <FirstStage />}
                            {stage === 2 && <SecondStage />}
                            {stage === 3 && <ThirdStage />}
                            {stage === 4 && <FourthStage />}
                            {stage === 5 && <Results/>}
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

const FirstStage = () => {
    return (
        <>
            <p>Is the data processing necessary, and is it proportional to the purpose?</p>
            <Field
                label={fieldPropsMapping['isDataProcessingNecessary']}
                name="isDataProcessingNecessary"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['isDataProcessingNecessary']}
                    />
                )}
            </Field>
            <Field
                name="isDataProcessingNecessaryAssessment"
                label={fieldPropsMapping['isDataProcessingNecessaryAssessment']}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
            <Field
                label={fieldPropsMapping['isProportionalToPurpose']}
                name="isProportionalToPurpose"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['isProportionalToPurpose']}
                    />
                )}
            </Field>
            <Field
                name="isProportionalToPurposeAssessment"
                label={fieldPropsMapping['isProportionalToPurposeAssessment']}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
        </>
    )
}

const SecondStage = () => {
    return (
        <>
            <p>What are the risks to the privacy and rights of the people whose data is being processed?</p>
            <p>1. Confidentiality and Integrity</p>
            <Field
                label={fieldPropsMapping['confidentialityRiskProbability']}
                name="confidentialityRiskProbability"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['confidentialityRiskProbability']}
                    />
                )}
            </Field>
            <Field
                label={fieldPropsMapping['confidentialityRiskSecurity']}
                name="confidentialityRiskSecurity"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['confidentialityRiskSecurity']}
                    />
                )}
            </Field>
            <Field
                name="confidentialityAssessment"
                label={fieldPropsMapping['confidentialityAssessment']}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
        </>
    )
}

const ThirdStage = () => {
    return (
        <>
            <p>What are the risks to the privacy and rights of the people whose data is being processed?</p>
            <p>2. Availability</p>
            <Field
                label={fieldPropsMapping['availabilityRiskProbability']}
                name="availabilityRiskProbability"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['availabilityRiskProbability']}
                    />
                )}
            </Field>
            <Field
                label={fieldPropsMapping['availabilityRiskSecurity']}
                name="availabilityRiskSecurity"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['availabilityRiskSecurity']}
                    />
                )}
            </Field>
            <Field
                name="availabilityAssessment"
                label={fieldPropsMapping['availabilityAssessment']}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
        </>
    )
}

const FourthStage = () => {
    return (
        <>
            <p>What are the risks to the privacy and rights of the people whose data is being processed?</p>
            <p>3. Transparency, anonymization and data minimization</p>
            <Field
                label={fieldPropsMapping['transparencyRiskProbability']}
                name="transparencyRiskProbability"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['transparencyRiskProbability']}
                    />
                )}
            </Field>
            <Field
                label={fieldPropsMapping['transparencyRiskSecurity']}
                name="transparencyRiskSecurity"
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['transparencyRiskSecurity']}
                    />
                )}
            </Field>
            <Field
                name="transparencyAssessment"
                label={fieldPropsMapping['transparencyAssessment']}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
        </>
    )
}

const Results = () => {
    return <p>Results:</p>
}
export default CreateRisk