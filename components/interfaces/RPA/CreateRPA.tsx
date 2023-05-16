import React, { useState, useCallback, Fragment, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "react-daisyui";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { DatePicker } from '@atlaskit/datetime-picker'
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select, {
  ValueType,
} from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';

import type { ApiResponse, TeamMemberWithUser } from "types";
import type { Task } from "@prisma/client";
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';


import Form, { ErrorMessage, Field, CheckboxField, FormFooter, HelperMessage } from '@atlaskit/form';
import { WithoutRing } from "sharedStyles";

import Message from "./Message";
import { format } from 'date-fns'
import { config, fieldPropsMapping, headers } from "./config";

interface Option {
  label: string;
  value: string;
}

const CreateRPA = ({
  visible,
  setVisible,
  task,
  members,
  mutateTask
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task;
  members: TeamMemberWithUser[] | null | undefined;
  mutateTask: () => Promise<void>
}) => {
  const { t } = useTranslation("common");

  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [procedure, setProcedure] = useState<any[]>([]);

  const cleanup = useCallback((reset: any) => {
    setProcedure([])
    setStage(0)
    reset()
  }, [])

  const saveProcedure = useCallback(async (procedure: any[], reset: any) => {
    setIsLoading(true)

    const response = await axios.post<ApiResponse<Task>>(`/api/tasks/${task.id}/rpa`, {
      procedure
    });

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    mutateTask()

    setIsLoading(false)
    setVisible(false)

    cleanup(reset)
  }, [])

  const validate = useCallback((formData: any) => {
    if (formData.reviewDate != null) {
      let date = new Date();
      date.setHours(0, 0, 0, 0);
      if (new Date(formData.reviewDate) <= date) {
        return "Review Date must not be in the past";
      }
    }
    return "";
  }, [])

  const onSubmit = useCallback(async (formData: any, { reset }: any) => {
    const message = validate(formData);

    if (procedure[stage] != null) {
      procedure[stage] = formData;
    } else {
      setProcedure([...procedure, formData]);
    }

    if (message !== "") {
      return setValidationMessage(message);
    }
    if (stage === 4) {
      const procedureToSave = procedure.length === 4 ? [...procedure, formData] : procedure
      await saveProcedure(procedureToSave, reset)
    } else {
      setStage(stage + 1);
    }
  }, [stage, procedure])

  const backHandler = useCallback(() => {
    if (stage > 0) {
      setStage(prev => prev - 1)
    }
  }, [stage])

  const closeHandler = useCallback((reset: any) => {
    setVisible(false)
    setProcedure([])
    cleanup(reset)
  }, [])

  useEffect(() => {
    const taskProperties = task.properties as any
    if (taskProperties?.rpa_procedure) {
      setProcedure(taskProperties.rpa_procedure)
    }
  }, [])

  return (
    <Modal open={visible}>
      <Form
        onSubmit={onSubmit}
      >
        {({ formProps, reset }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">{`Register Record of Processing Activities ${stage + 1}/5`}</Modal.Header>
            <Modal.Body>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  margin: '0 auto',
                  flexDirection: 'column',
                }}
              >
                <h3 className="text-1xl font-bold">{headers[stage]}</h3>
                <Message
                  text={`The record of processing activities allows you to make an inventory of the data processing and to have
                    an overview of what you are
                    doing with the concerned personal data. The recording obligation is stated by article 30 of the GDPR.
                    It is an application to help you to be compliant with the Regulation.`}
                />
                {stage === 0 &&
                  <>
                    <Message
                      appearance="warning"
                      text={`A personal data processing is an operation, or set of operations, involving personal data,
                        whatever
                        the method used (collection, recording, organisation, storage, adaptation, modification, extraction,
                        consultation, use, communication by diffusion, transmission or any other form of making available,
                        linkage).`}
                    />
                    {validationMessage &&
                      <Message
                        appearance="error"
                        text={validationMessage}
                      />
                    }
                    <Field
                      name="reviewDate"
                      label={fieldPropsMapping["reviewDate"]}
                      defaultValue={procedure[0] ? procedure[0].reviewDate : format(new Date(), 'yyyy-MM-dd')}
                      isRequired
                      aria-required={true}
                      validate={async (value) => {
                        if (value) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a due date');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <DatePicker placeholder={format(new Date(), "MM/dd/yyyy")} selectProps={{ inputId: id }} {...rest} />
                          </WithoutRing>
                          {!error && (
                            <HelperMessage>
                              Specify a future date for reviewing the record
                            </HelperMessage>
                          )}
                          {error && <ErrorMessage>{error}</ErrorMessage>}
                        </Fragment>
                      )}
                    </Field>
                    <Field
                      aria-required={true}
                      name="controller"
                      label={fieldPropsMapping["controller"]}
                      defaultValue={procedure[0] && procedure[0].controller}
                      isRequired
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField autoComplete="off" {...fieldProps} />
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<Option>>
                      name="dpo"
                      label={fieldPropsMapping["dpo"]}
                      defaultValue={procedure[0] && procedure[0].dpo}
                      aria-required={true}
                      isRequired
                      validate={async (value) => {
                        if (value) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a dpo');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={members?.map(({ user }) => ({ value: user.id, label: user.name }))} validationState={error ? 'error' : 'default'} />
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                  </>
                }
                {stage === 1 &&
                  <>
                    <Message
                      appearance="warning"
                      text={<span>A data processing operation must have a purpose, a finality, i.e. you cannot collect or process
                        personal data simply in case it would be useful to you one day. Each data processing operation must be
                        assigned a purpose, which must of course be lawful and legitimate in the context of your professional
                        activity.<br /><em>Example: You collect a lot of information from your customers, when you make a delivery, issue
                          an
                          invoice or offer a loyalty card. All these operations on these data represent your processing of
                          personal
                          data for the purpose of managing your customers.</em></span>
                      }
                    />
                    <Field
                      name="purpose"
                      label={fieldPropsMapping["purpose"]}
                      defaultValue={procedure[1] && procedure[1].purpose}
                    >
                      {({ fieldProps }: any) => (
                        <Fragment>
                          <TextArea
                            placeholder="Describe the principles to processing of personal data if any."
                            {...fieldProps}
                          />
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<Option, true>>
                      name="category"
                      label={fieldPropsMapping["category"]}
                      defaultValue={procedure[1] && procedure[1].category}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value && value.length > 0) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a categories');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.category} validationState={error ? 'error' : 'default'} isMulti />
                            {!error && <HelperMessage>Multiple selection possible for Personal Data</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<Option, true>>
                      name="specialcategory"
                      label={fieldPropsMapping["specialcategory"]}
                      defaultValue={procedure[1] && procedure[1].specialcategory}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value && value.length > 0) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a categories');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.specialcategory} validationState={error ? 'error' : 'default'} isMulti />
                            {!error && <HelperMessage>Multiple selection possible</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<Option, true>>
                      name="datasubject"
                      label={fieldPropsMapping["datasubject"]}
                      defaultValue={procedure[1] && procedure[1].datasubject}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value && value.length > 0) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a categories');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.datasubject} validationState={error ? 'error' : 'default'} isMulti />
                            {!error && <HelperMessage>Multiple selection possible, and if others please specify on the ticket</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<Option>>
                      name="retentionperiod"
                      label={fieldPropsMapping["retentionperiod"]}
                      defaultValue={procedure[1] && procedure[1].retentionperiod}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a period');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.retentionperiod} validationState={error ? 'error' : 'default'} />
                            {!error && <HelperMessage>Please specify the data retention period</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field
                      name="commentsretention"
                      label={fieldPropsMapping["commentsretention"]}
                      defaultValue={procedure[1] && procedure[1].commentsretention}
                    >
                      {({ fieldProps }: any) => (
                        <Fragment>
                          <TextArea
                            placeholder="In some cases (payroll management), it is necessary to retain certain data for a longer period of time, depending on your legal
                            obligations or if the data are of administrative interest (litigation)."
                            {...fieldProps}
                          />
                        </Fragment>
                      )}
                    </Field>
                  </>
                }
                {stage === 2 &&
                  <>
                    <Message
                      appearance="warning"
                      text={
                        <span>
                          List all persons who have access to the data;<br />For example: recruitment department, IT department, management, service providers, partners, hosts, etc.
                        </span>
                      }
                    />
                    <Field<ValueType<Option>>
                      name="recipientType"
                      label={fieldPropsMapping["recipientType"]}
                      defaultValue={procedure[2] && procedure[2].recipientType}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a type');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.recipientType} validationState={error ? 'error' : 'default'} />
                            {!error && <HelperMessage>Please specify the type of recipient if not on a list specify on details</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field
                      name="recipientdetails"
                      label={fieldPropsMapping["recipientdetails"]}
                      defaultValue={procedure[2] && procedure[2].recipientdetails}
                    >
                      {({ fieldProps }: any) => (
                        <Fragment>
                          <TextArea
                            placeholder="Write details if you select others or there is no recipeint type above."
                            {...fieldProps}
                          />
                        </Fragment>
                      )}
                    </Field>
                  </>
                }
                {stage === 3 &&
                  <>
                    <Message
                      appearance="warning"
                      text={
                        <span>
                          When you transfer data outside the European Union: <br />
                          - Check whether the country outside the EU to which you are transferring the data has data
                          protection
                          legislation and whether it is recognised as adequate by the European Commission. <br />
                          - A map of the world presenting data protection legislation. <br />
                          - Otherwise, you will have to provide a legal framework your transfers to ensure data protection
                          abroad.
                        </span>
                      }
                    />
                    <CheckboxField name="datatransfer" defaultIsChecked={procedure[3] != null ? procedure[3].datatransfer : false}>
                      {({ fieldProps }) => (
                        <Checkbox {...fieldProps} label={fieldPropsMapping["datatransfer"]} />
                      )}
                    </CheckboxField>
                    <Field
                      aria-required={true}
                      name="recipient"
                      label={fieldPropsMapping["recipient"]}
                      defaultValue={procedure[3] && procedure[3].recipient}
                      isRequired
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField autoComplete="off" {...fieldProps} />
                          {!error && <HelperMessage>Recipient is a natural or legal person, public authority, agency or another body which the personal data are disclosed.</HelperMessage>}
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<Option>>
                      name="country"
                      label={fieldPropsMapping["country"]}
                      defaultValue={procedure[3] && procedure[3].country}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select a country');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.country} validationState={error ? 'error' : 'default'} />
                            {!error && <HelperMessage>Please select from the list</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<Option, true>>
                      name="guarantee"
                      label={fieldPropsMapping["guarantee"]}
                      defaultValue={procedure[3] && procedure[3].guarantee}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select at least one');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.guarantee} validationState={error ? 'error' : 'default'} isMulti />
                            {!error && <HelperMessage>Multiple selection possible, and if None please specify on the ticket</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Message
                      appearance="warning"
                      text={<span>Please attach relevant documents to the ticket.</span>}
                    />
                  </>
                }
                {stage === 4 &&
                  <>
                    <Message
                      appearance="warning"
                      text={
                        <span>
                          Secure your data:<br />
                          - Ensure the integrity of your data assets by minimizing the risk of data loss or
                          hacking.<br />
                          - The measures to be taken, whether electronic or physical, depend on the sensitiveness of the
                          data you are processing and the risks to data subjects in the event of an incident. <br />
                          - Various actions must be implemented: updating your antivirus and software, regularly
                          changing passwords and adopting complex passwords, or encrypting your data in certain situations.
                          In the event of loss or theft of an eletronic device,
                          it will be more difficult for a third party to access it.
                        </span>
                      }
                    />
                    <Field<ValueType<Option, true>>
                      name="toms"
                      label={fieldPropsMapping["toms"]}
                      defaultValue={procedure[4] && procedure[4].toms}
                      aria-required={true}
                      isRequired
                      validate={async (value: any) => {
                        if (value) {
                          return undefined;
                        }

                        return new Promise((resolve) =>
                          setTimeout(resolve, 300),
                        ).then(() => 'Please select at least one');
                      }}
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select inputId={id} {...rest} options={config.toms} validationState={error ? 'error' : 'default'} isMulti />
                            {!error && <HelperMessage>Multiple selection possible, and if others please specify on the ticket</HelperMessage>}
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Message
                      appearance="warning"
                      text="Please attach the relevant security certification and documents to the ticket."
                    />
                  </>
                }
                <FormFooter>
                </FormFooter>
              </div>
            </Modal.Body>
            <Modal.Actions>
              <AtlaskitButton
                appearance="default"
                onClick={() => closeHandler(reset)}
                isDisabled={isLoading}
              >
                {t("close")}
              </AtlaskitButton>
              <AtlaskitButton
                appearance="default"
                onClick={backHandler}
                isDisabled={stage === 0 || isLoading}
              >
                Back
              </AtlaskitButton>
              <LoadingButton
                type="submit"
                appearance="primary"
                isLoading={isLoading}
              >
                {stage < 4
                  ? t("next")
                  : t("save")
                }
              </LoadingButton>
            </Modal.Actions>
          </form>
        )}
      </Form>

    </Modal>
  );
};

export default CreateRPA;
