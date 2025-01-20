import React, { Fragment, useState, useEffect, Dispatch, SetStateAction } from 'react';
import TextArea from '@atlaskit/textarea';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';
import type { Task } from '@prisma/client';
import { StageTracker, TaskPickerFormBody } from '@/components/shared/atlaskit';
import { fieldPropsMapping, headers } from '@/components/defaultLanding/data/configs/rm';
import Range from '@atlaskit/range';
import {
    Field,
    RangeField,
    HelperMessage,
    ErrorMessage,
} from '@atlaskit/form';
import { useRouter } from 'next/router';
import useTeamMembers from 'hooks/useTeamMembers';
import { WithoutRing } from 'sharedStyles';
import Select, { ValueType } from '@atlaskit/select';
import { RmOption, ApiResponse, TaskProperties, RMProcedureInterface } from 'types';
import { Error, Loading } from '@/components/shared';

interface CreateRiskProps {
    selectedTask?: Task;
    tasks?: Task[];
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>
    mutateTasks: () => Promise<void>;
}

const CreateRisk = ({ selectedTask, tasks, visible, setVisible, mutateTasks }: CreateRiskProps) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { slug } = router.query;


    // stage 0 - task selection
    // stage 1 - impact form
    // stage 2 - treatment form
    const [stage, setStage] = useState<number>(0)
    const [task, setTask] = useState<Task | undefined>(selectedTask);
    const [risk, setRisk] = useState<any>([]);
    const [prevRisk, setPrevRisk] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const saveRisk = async ({ risk, prevRisk }: { risk: any, prevRisk: any }) => {
        try {
            setIsLoading(true)
            if (!task) {
                return
            }

            const response = await axios.post<ApiResponse<Task>>(
                `/api/teams/${slug}/tasks/${task.taskNumber}/rm`,
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
                toast.success(t('rm-created'));
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
        switch (stage) {
            case 0: {
                const task = formData.task.value;
                setTask(task);
                setStage(1);
                break;
            }
            case 1: {
                const riskToSave = [...risk]
                riskToSave[stage - 1] = formData
                setRisk(riskToSave)
                setStage(stage + 1);
                break;
            }
            case 2: {
                const riskToSave = [...risk]
                riskToSave[stage - 1] = formData
                setRisk(riskToSave)
                saveRisk({ risk: riskToSave, prevRisk })
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

        const prevRisk = (task.properties as TaskProperties)?.rm_risk

        if (prevRisk) {
            setPrevRisk(prevRisk)
            setRisk(prevRisk)
        }

        setStage(1)
    }, [task])

    return (
        <Modal open={visible}>
            <Form onSubmit={onSubmit}>
                {({ formProps }) => (
                    <form {...formProps}>
                        <Modal.Header className="font-bold">
                            {stage === 0 && `Select a task`}
                            {stage > 0 && <StageTracker headers={headers} currentStage={stage - 1}/>}
                            {/* {stage === 1 && `Add Risk 1/2 `}
                            {stage === 2 && `Add Risk 2/2 `} */}
                        </Modal.Header>
                        <Modal.Body>
                            {stage === 0 && tasks && <TaskPickerFormBody tasks={tasks.filter(task => !(task.properties as any)?.rm_risk)} />}
                            {stage === 1 && <FirstStage risk={risk} />}
                            {stage === 2 && <SecondStage risk={risk} />}
                        </Modal.Body>
                        <Modal.Actions>
                            <AtlaskitButton
                                appearance="default"
                                onClick={() => setVisible(false)}
                            >
                                {t('close')}
                            </AtlaskitButton>
                            <AtlaskitButton
                                appearance="default"
                                onClick={() => setStage(prev => prev - 1)}
                                isDisabled={stage <= 1 || isLoading}
                            >
                                {t('back')}
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

const FirstStage = ({ risk }: { risk: RMProcedureInterface }) => {

    const router = useRouter();
    const { slug } = router.query;
    const { isLoading, isError, members } = useTeamMembers(slug as string);

    if (isLoading) {
        return <Loading />;
    }

    if (!members || isError) {
        return <Error message={isError.message} />;
    }

    return (
        <>
            <Field
                name="Risk"
                label={fieldPropsMapping['Risk']}
                defaultValue={risk[0]?.Risk}
                aria-required={true}
                isRequired
            >
                {({ fieldProps }: any) => (
                    <Fragment>
                        <TextArea
                            placeholder={`Describe the information security risk briefly so that people will understand what risk you are assessing.`}
                            autoComplete="off"
                            {...fieldProps}
                        />
                    </Fragment>
                )}
            </Field>

            <Field<ValueType<RmOption>>
                name="AssetOwner"
                label={fieldPropsMapping['AssetOwner']}
                defaultValue={risk[0]?.AssetOwner}
                aria-required={true}
                isRequired
                validate={async (value) => {
                    if (value) {
                        return undefined;
                    }

                    return new Promise((resolve) => setTimeout(resolve, 300)).then(
                        () => 'Please select an asset owner'
                    );
                }}
            >
                {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                        <WithoutRing>
                            <Select
                                inputId={id}
                                {...rest}
                                options={members?.map(({ user }) => ({
                                    value: user.id,
                                    label: user.name,
                                }))}
                                validationState={error ? 'error' : 'default'}
                            />
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                            <HelperMessage>
                                Who is the Information Asset Owner, the person accountable if the risk treatments are inadequate,
                                incidents occur, and the organization is adversely impacted? This person must assess and treat risks adequately.
                            </HelperMessage>
                        </WithoutRing>
                    </Fragment>
                )}
            </Field>

            <Field
                name="Impact"
                label={fieldPropsMapping['Impact']}
                defaultValue={risk[0]?.Impact}
                aria-required={true}
                isRequired
            >
                {({ fieldProps }: any) => (
                    <Fragment>
                        <TextArea
                            placeholder={`Describe the potential impacts in business terms if the risk occurs. Decide whether to use "worst case" or "anticipated" impacts consistently.`}
                            autoComplete="off"
                            {...fieldProps}
                        />
                    </Fragment>
                )}
            </Field>

            <RangeField
                name="RawProbability"
                label={fieldPropsMapping['RawProbability']}
                defaultValue={risk[0]?.RawProbability || 50}
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
                            <HelperMessage>
                                Enter the likelihood that the risk would occur untreated, as a percentage value.
                            </HelperMessage>
                            <Range min={1} max={100} step={1} {...fieldProps} />
                            <HelperMessage>
                                {`${fieldProps?.value} percent (max. 100)`}
                            </HelperMessage>
                        </>
                    );
                }}
            </RangeField>

            <RangeField
                name="RawImpact"
                label={fieldPropsMapping['RawImpact']}
                defaultValue={risk[0]?.RawImpact || 50}
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
                            <HelperMessage>
                                Enter the potential business impact if the risk occurred without any treatment, as a percentage value.
                            </HelperMessage>
                            <Range min={1} max={100} step={1} {...fieldProps} />
                            <HelperMessage>
                                {`${fieldProps?.value} percent (max. 100)`}
                            </HelperMessage>
                        </>
                    );
                }}
            </RangeField>
        </>
    )
}

const SecondStage = ({ risk }: { risk: RMProcedureInterface }) => {
    return (
        <>
            <Field
                name="RiskTreatment"
                label={fieldPropsMapping['RiskTreatment']}
                defaultValue={risk[1]?.RiskTreatment}
                aria-required={true}
                isRequired
            >
                {({ fieldProps }: any) => (
                    <Fragment>
                        <TextArea
                            placeholder={`Describe how the risk is to be treated (e.g., controlled, avoided, transferred, or accepted).`}
                            autoComplete="off"
                            {...fieldProps}
                        />
                    </Fragment>
                )}
            </Field>

            <Field
                name="TreatmentCost"
                label={fieldPropsMapping['TreatmentCost']}
                defaultValue={risk[1]?.TreatmentCost}
                aria-required={true}
                isRequired
            >
                {({ fieldProps }: any) => (
                    <Fragment>
                        <TextArea
                            placeholder={`Estimate the total cost of mitigating the risk.`}
                            autoComplete="off"
                            {...fieldProps}
                        />
                    </Fragment>
                )}
            </Field>

            <RangeField
                name="TreatmentStatus"
                label={fieldPropsMapping['TreatmentStatus']}
                defaultValue={risk[1]?.TreatmentStatus || 50}
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
                            <HelperMessage>
                                To what extent is the planned treatment in place? 0% means only a plan exists;
                                100% means the treatment is fully operational.
                            </HelperMessage>
                            <Range min={1} max={100} step={1} {...fieldProps} />
                            <HelperMessage>
                                {`${fieldProps?.value} percent (max. 100)`}
                            </HelperMessage>
                        </>
                    );
                }}
            </RangeField>

            <RangeField
                name="TreatedProbability"
                label={fieldPropsMapping['TreatedProbability']}
                defaultValue={risk[1]?.TreatedProbability || 50}
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
                            <HelperMessage>
                                Enter the probability that the risk will occur after mitigation.
                            </HelperMessage>
                            <Range min={1} max={100} step={1} {...fieldProps} />
                            <HelperMessage>
                                {`${fieldProps?.value} percent (max. 100)`}
                            </HelperMessage>
                        </>
                    );
                }}
            </RangeField>

            <RangeField
                name="TreatedImpact"
                label={fieldPropsMapping['TreatedImpact']}
                defaultValue={risk[1]?.TreatedImpact || 50}
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
                            <HelperMessage>
                                Enter the likely impact after mitigation. Incidents due to control failures may have higher impacts.
                                Bold treated values if they differ from raw values.
                            </HelperMessage>
                            <Range min={1} max={100} step={1} {...fieldProps} />
                            <HelperMessage>
                                {`${fieldProps?.value} percent (max. 100)`}
                            </HelperMessage>
                        </>
                    );
                }}
            </RangeField>
        </>
    )
}

export default CreateRisk