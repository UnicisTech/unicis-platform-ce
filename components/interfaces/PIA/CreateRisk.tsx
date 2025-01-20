import React, { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import { RadioGroup } from '@atlaskit/radio';
import Textfield from '@atlaskit/textfield';
import Form, {
    ErrorMessage,
    Field,
    FieldProps,
    CheckboxField,
    FormFooter,
    HelperMessage,
} from '@atlaskit/form';
import TextArea from '@atlaskit/textarea';
import { fieldPropsMapping, config, riskSecurityPoints, riskProbabilityPoints, headers } from '@/components/defaultLanding/data/configs/pia';
import { StageTracker, TaskPickerFormBody } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';
import RiskMatrixBubbleChart from './RiskMatrixBubbleChart';
import type { PiaRisk, ApiResponse, TaskProperties } from 'types';

const shouldShowExtraFields = (risk: PiaRisk): boolean => {
    const confidentialityRisk = riskProbabilityPoints[risk[1].confidentialityRiskProbability] * riskSecurityPoints[risk[1].confidentialityRiskSecurity]
    const availabilityRisk = riskProbabilityPoints[risk[2].availabilityRiskProbability] * riskSecurityPoints[risk[2].availabilityRiskSecurity]
    const transparencyRisk = riskProbabilityPoints[risk[3].transparencyRiskProbability] * riskSecurityPoints[risk[3].transparencyRiskSecurity]

    return [confidentialityRisk, availabilityRisk, transparencyRisk].some(r => r > 10);
}

interface CreateRiskProps {
    selectedTask?: Task;
    tasks?: Task[];
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    mutateTasks: () => Promise<void>;

}

const CreateRisk = ({ selectedTask, tasks, visible, setVisible, mutateTasks }: CreateRiskProps) => {
    const { t } = useTranslation('common');

    const router = useRouter();
    const { slug } = router.query;

    const [stage, setStage] = useState<number>(0)
    const [task, setTask] = useState<Task | undefined>(selectedTask);
    const [risk, setRisk] = useState<any>([])
    const [prevRisk, setPrevRisk] = useState<any>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
 
    const saveRisk = async ({ risk, prevRisk }: { risk: any, prevRisk: any }) => {
        try {
            setIsLoading(true)
            if (!task) {
                return
            }

            const response = await axios.post<ApiResponse<Task>>(
                `/api/teams/${slug}/tasks/${task.taskNumber}/pia`,
                {
                    prevRisk: prevRisk,
                    nextRisk: risk,
                }
            );

            const { error } = response.data;

            if (error) {
                toast.error(error.message);
                return;
            } else {
                toast.success(t('tia-created'));
            }

            mutateTasks()
            setVisible(false)
        } catch (error: any) {
            toast.error('Unexpected error')
        } finally {
            setIsLoading(false)
        }
    }

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
            case 4:
                const riskToSave = [...risk]
                riskToSave[stage - 1] = formData
                setRisk(riskToSave)
                setStage(stage + 1);
                break;
            case 5: {
                const showNextStage = shouldShowExtraFields(risk)

                if (showNextStage) {
                    setStage(stage + 1);
                    break;
                } else {
                    saveRisk({ risk, prevRisk });
                    break;
                }
            }
            case 6: {
                const riskToSave = [...risk]
                riskToSave[4] = formData
                setRisk(riskToSave)
                saveRisk({ risk, prevRisk });
                break;
            }

            default: {
                console.warn('Unexpected stage:', stage);
                break;
            }
        }
    };

    useEffect(() => {
        if (!task) {
            return
        }

        const prevRisk = (task.properties as TaskProperties)?.pia_risk

        if (prevRisk) {
            setPrevRisk(prevRisk)
        }

        setStage(1)
    }, [task])


    return (
        <Modal open={visible} className='w-11/12 max-w-3xl'>
            <Form onSubmit={onSubmit}>
                {({ formProps }) => (
                    <form {...formProps}>
                        <Modal.Header className="font-bold">
                            {stage === 0 && 'Select a task'}
                            {stage > 0  && <StageTracker headers={headers} currentStage={stage - 1}/>}
                        </Modal.Header>
                        <Modal.Body>
                            {stage === 0 && tasks && <TaskPickerFormBody tasks={tasks.filter(task => !(task.properties as any)?.pia_risk)} />}
                            {stage === 1 && <FirstStage risk={prevRisk} />}
                            {stage === 2 && <SecondStage risk={prevRisk}/>}
                            {stage === 3 && <ThirdStage risk={prevRisk}/>}
                            {stage === 4 && <FourthStage risk={prevRisk}/>}
                            {stage === 5 && <Results risk={risk}/>}
                            {stage === 6 && <ExtraStage risk={prevRisk}/>}
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
                                isLoading={isLoading}
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

const FirstStage = ({ risk }: { risk: PiaRisk | [] }) => {
    return (
        <>
            <p>Is the data processing necessary, and is it proportional to the purpose?</p>
            <Field
                label={fieldPropsMapping['isDataProcessingNecessary']}
                name="isDataProcessingNecessary"
                defaultValue={risk[0]?.isDataProcessingNecessary || ""}
                isRequired
                id='test10'
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
                defaultValue={risk[0]?.isDataProcessingNecessaryAssessment || ""}
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
                defaultValue={risk[0]?.isProportionalToPurpose || ""}
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
                defaultValue={risk[0]?.isProportionalToPurposeAssessment || ""}
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

const SecondStage = ({ risk }: {risk: PiaRisk | []}) => {
    return (
        <>
            <p>What are the risks to the privacy and rights of the people whose data is being processed?</p>
            <p>1. Confidentiality and Integrity</p>
            <Field
                label={fieldPropsMapping['confidentialityRiskProbability']}
                name="confidentialityRiskProbability"
                defaultValue={risk[1]?.confidentialityRiskProbability || ""}
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
                defaultValue={risk[1]?.confidentialityRiskSecurity || ""}
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
                defaultValue={risk[1]?.confidentialityAssessment}
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

const ThirdStage = ({ risk }: { risk: PiaRisk | []}) => {
    return (
        <>
            <p>What are the risks to the privacy and rights of the people whose data is being processed?</p>
            <p>2. Availability</p>
            <Field
                label={fieldPropsMapping['availabilityRiskProbability']}
                name="availabilityRiskProbability"
                defaultValue={risk[2]?.availabilityRiskProbability || ""}
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
                defaultValue={risk[2]?.availabilityRiskSecurity || ""}
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
                defaultValue={risk[2]?.availabilityAssessment || ""}
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

const FourthStage = ({ risk }: {risk: PiaRisk | []}) => {
    return (
        <>
            <p>What are the risks to the privacy and rights of the people whose data is being processed?</p>
            <p>3. Transparency, anonymization and data minimization</p>
            <Field
                label={fieldPropsMapping['transparencyRiskProbability']}
                name="transparencyRiskProbability"
                defaultValue={risk[3]?.transparencyRiskProbability || ""}
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
                defaultValue={risk[3]?.transparencyRiskSecurity || ""}
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
                defaultValue={risk[3]?.transparencyAssessment || ""}
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

const Results = ({ risk }: { risk: PiaRisk }) => {
    return (
        <>
            <p>a) Confidentiality and Integrity</p>
            <RiskMatrixBubbleChart
                datasets={[
                    {
                        label: "Confidentiality and Integrity Risk",
                        borderWidth: 1,
                        data: [{
                            x: riskSecurityPoints[risk[1].confidentialityRiskSecurity],
                            y: riskProbabilityPoints[risk[1].confidentialityRiskProbability],
                            r: 15
                        }],
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                    }
                ]}
            />
            <p>b) Availability</p>
            <RiskMatrixBubbleChart
                datasets={[
                    {
                        label: "Availability",
                        borderWidth: 1,
                        data: [{
                            x: riskSecurityPoints[risk[2].availabilityRiskSecurity],
                            y: riskProbabilityPoints[risk[2].availabilityRiskProbability],
                            r: 15
                        }],
                        backgroundColor: "rgba(0, 0, 0, 0.7)",

                    }
                ]}
            />
            <p>c) Transparency, purpose limitation and data minimization</p>
            <RiskMatrixBubbleChart
                datasets={[
                    {
                        label: "Transparency, purpose limitation and data minimization",
                        borderWidth: 1,
                        data: [{
                            x: riskSecurityPoints[risk[3].transparencyRiskSecurity],
                            y: riskProbabilityPoints[risk[3].transparencyRiskProbability],
                            r: 15
                        }],
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                    }
                ]}
            />
        </>
    )
}

const ExtraStage = ({ risk }: { risk: PiaRisk | []}) => {
    return (
        <>
            <p>Corrective measures</p>
            <Field
                name="guarantees"
                label={fieldPropsMapping['guarantees']}
                defaultValue={risk[4]?.guarantees || ""}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
            <Field
                name="securityMeasures"
                label={fieldPropsMapping['securityMeasures']}
                defaultValue={risk[4]?.securityMeasures || ""}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
            <Field
                name="securityCompliance"
                label={fieldPropsMapping['securityCompliance']}
                defaultValue={risk[4]?.securityCompliance || ""}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
            <Field
                label={fieldPropsMapping['dealingWithResidualRisk']}
                name="dealingWithResidualRisk"
                defaultValue={risk[4]?.dealingWithResidualRisk || ""}
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['dealingWithResidualRisk']}
                    />
                )}
            </Field>
            <Field
                name="dealingWithResidualRiskAssessment"
                label={fieldPropsMapping['dealingWithResidualRiskAssessment']}
                defaultValue={risk[4]?.dealingWithResidualRiskAssessment || ""}
            >
                {({ fieldProps }: any) => (
                    <TextArea
                        {...fieldProps}
                    />
                )}
            </Field>
            <Field
                label={fieldPropsMapping['supervisoryAuthorityInvolvement']}
                name="supervisoryAuthorityInvolvement"
                defaultValue={risk[4]?.supervisoryAuthorityInvolvement || ""}
                isRequired
            >
                {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <RadioGroup
                        {...fieldProps}
                        options={config['supervisoryAuthorityInvolvement']}
                    />
                )}
            </Field>
        </>
    )
}
export default CreateRisk