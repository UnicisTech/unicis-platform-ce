import React, { Fragment, useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import TextArea from '@atlaskit/textarea';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';
import type { Task } from '@prisma/client';
import { TaskPickerFormBody } from '@/components/shared/atlaskit';
import { fieldPropsMapping } from '@/components/defaultLanding/data/configs/rm';
import Range from '@atlaskit/range';
import {
    Field,
    RangeField,
    FieldProps,
    FormFooter,
    HelperMessage,
    ErrorMessage,
} from '@atlaskit/form';
import { useRouter } from 'next/router';
import useTeamMembers from 'hooks/useTeamMembers';
import { WithoutRing } from 'sharedStyles';
import Select, { ValueType } from '@atlaskit/select';
import { RmOption } from 'types';
import { Error, Loading } from '@/components/shared';

interface CreateRiskProps {
    tasks: Task[];
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>
}

const CreateRisk = ({ tasks, visible, setVisible }: CreateRiskProps) => {
    const { t } = useTranslation('common');

    // stage 0 - task selection
    // stage 1 - impact form
    // stage 2 - treatment form
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
            case 2: {
                // TODO: Saving logic for stages 1 and 2
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
                        <Modal.Header className="font-bold">
                            {stage === 0 && `Select a task`}
                            {stage === 1 && `Add Risk 1/2 `}
                            {stage === 2 && `Add Risk 2/2 `}
                        </Modal.Header>
                        <Modal.Body>
                            {stage === 0 && <TaskPickerFormBody tasks={tasks} />}
                            {stage === 1 && <FirstStage />}
                            {stage === 2 && <SecondStage />}
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
                //   defaultValue={procedure[0]?.DataExporter}
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
                //   defaultValue={procedure[0] && procedure[0].dpo}
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
                        </WithoutRing>
                    </Fragment>
                )}
            </Field>

            <Field
                name="Impact"
                label={fieldPropsMapping['Impact']}
                //   defaultValue={procedure[0]?.DataExporter}
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
                defaultValue={0} //To be added from procedure[0]
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
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
                defaultValue={0} //To be added from procedure[0]
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
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

const SecondStage = () => {
    return (
        <>
            <Field
                name="RiskTreatment"
                label={fieldPropsMapping['RiskTreatment']}
                //   defaultValue={procedure[0]?.DataExporter}
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
                //   defaultValue={procedure[0]?.DataExporter}
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
                defaultValue={0} //To be added from procedure[0]
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
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
                defaultValue={0} //To be added from procedure[0]
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
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
                defaultValue={0} //To be added from procedure[0]
            >
                {({ fieldProps }) => {
                    console.log('fieldProps range', fieldProps);
                    return (
                        <>
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