import React, { Fragment } from 'react';
import { Error, Loading } from '@/components/shared';
import { DatePicker } from '@atlaskit/datetime-picker';
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select, { ValueType } from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import { RadioGroup } from '@atlaskit/radio';
import {
  ErrorMessage,
  Field,
  FieldProps,
  CheckboxField,
  FormFooter,
  HelperMessage,
} from '@atlaskit/form';
import type { RpaOption } from 'types';
import { WithoutRing } from 'sharedStyles';
import { Message } from '@/components/shared/atlaskit';
import { format } from 'date-fns';
import useTeamMembers from 'hooks/useTeamMembers';
import { useRouter } from 'next/router';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';

interface FormBodyProps {
  stage: number;
  validationMessage: string;
  procedure: any[];
}

const CreateFormBody = ({
  stage,
  validationMessage,
  procedure,
}: FormBodyProps) => {
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
      <div
        style={{
          display: 'flex',
          width: '100%',
          margin: '0 auto',
          flexDirection: 'column',
        }}
      >
        <Message
          text={`The record of processing activities allows you to make an inventory of the data processing and to have
                    an overview of what you are
                    doing with the concerned personal data. The recording obligation is stated by article 30 of the GDPR.
                    It is an application to help you to be compliant with the Regulation.`}
        />
        {stage === 0 && (
          <>
            <Message
              appearance="warning"
              text={`A personal data processing is an operation, or set of operations, involving personal data,
                        whatever
                        the method used (collection, recording, organisation, storage, adaptation, modification, extraction,
                        consultation, use, communication by diffusion, transmission or any other form of making available,
                        linkage).`}
            />
            {validationMessage && (
              <Message appearance="error" text={validationMessage} />
            )}
            <Field
              name="reviewDate"
              label={fieldPropsMapping['reviewDate']}
              defaultValue={
                procedure[0]
                  ? procedure[0].reviewDate
                  : format(new Date(), 'yyyy-MM-dd')
              }
              isRequired
              aria-required={true}
              validate={async (value) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a due date'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <DatePicker
                      placeholder={format(new Date(), 'MM/dd/yyyy')}
                      selectProps={{ inputId: id }}
                      {...rest}
                    />
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
              label={fieldPropsMapping['controller']}
              defaultValue={procedure[0] && procedure[0].controller}
              isRequired
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>
            <Field<ValueType<RpaOption>>
              name="dpo"
              label={fieldPropsMapping['dpo']}
              defaultValue={procedure[0] && procedure[0].dpo}
              aria-required={true}
              isRequired
              validate={async (value) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a dpo'
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
          </>
        )}
        {stage === 1 && (
          <>
            <Message
              appearance="warning"
              text={
                <span>
                  A data processing operation must have a purpose, a finality,
                  i.e. you cannot collect or process personal data simply in
                  case it would be useful to you one day. Each data processing
                  operation must be assigned a purpose, which must of course be
                  lawful and legitimate in the context of your professional
                  activity.
                  <br />
                  <em>
                    Example: You collect a lot of information from your
                    customers, when you make a delivery, issue an invoice or
                    offer a loyalty card. All these operations on these data
                    represent your processing of personal data for the purpose
                    of managing your customers.
                  </em>
                </span>
              }
            />
            <Field
              name="purpose"
              label={fieldPropsMapping['purpose']}
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
            <Field<ValueType<RpaOption, true>>
              name="category"
              label={fieldPropsMapping['category']}
              defaultValue={procedure[1] && procedure[1].category}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value && value.length > 0) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a categories'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.category}
                      validationState={error ? 'error' : 'default'}
                      isMulti
                    />
                    {!error && (
                      <HelperMessage>
                        Multiple selection possible for Personal Data
                      </HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Field<ValueType<RpaOption, true>>
              name="specialcategory"
              label={fieldPropsMapping['specialcategory']}
              defaultValue={procedure[1] && procedure[1].specialcategory}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value && value.length > 0) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a categories'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.specialcategory}
                      validationState={error ? 'error' : 'default'}
                      isMulti
                    />
                    {!error && (
                      <HelperMessage>Multiple selection possible</HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Field<ValueType<RpaOption, true>>
              name="datasubject"
              label={fieldPropsMapping['datasubject']}
              defaultValue={procedure[1] && procedure[1].datasubject}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value && value.length > 0) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a categories'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.datasubject}
                      validationState={error ? 'error' : 'default'}
                      isMulti
                    />
                    {!error && (
                      <HelperMessage>
                        Multiple selection possible, and if others please
                        specify on the ticket
                      </HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Field<ValueType<RpaOption>>
              name="retentionperiod"
              label={fieldPropsMapping['retentionperiod']}
              defaultValue={procedure[1] && procedure[1].retentionperiod}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a period'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.retentionperiod}
                      validationState={error ? 'error' : 'default'}
                    />
                    {!error && (
                      <HelperMessage>
                        Please specify the data retention period
                      </HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Field
              name="commentsretention"
              label={fieldPropsMapping['commentsretention']}
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
        )}
        {stage === 2 && (
          <>
            <Message
              appearance="warning"
              text={
                <span>
                  List all persons who have access to the data;
                  <br />
                  For example: recruitment department, IT department,
                  management, service providers, partners, hosts, etc.
                </span>
              }
            />
            <Field<ValueType<RpaOption>>
              name="recipientType"
              label={fieldPropsMapping['recipientType']}
              defaultValue={procedure[2] && procedure[2].recipientType}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a type'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.recipientType}
                      validationState={error ? 'error' : 'default'}
                    />
                    {!error && (
                      <HelperMessage>
                        Please specify the type of recipient if not on a list
                        specify on details
                      </HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Field
              name="recipientdetails"
              label={fieldPropsMapping['recipientdetails']}
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
        )}
        {stage === 3 && (
          <>
            <Message
              appearance="warning"
              text={
                <span>
                  When you transfer data outside the European Union: <br />
                  - Check whether the country outside the EU to which you are
                  transferring the data has data protection legislation and
                  whether it is recognised as adequate by the European
                  Commission. <br />- A map of the world presenting data
                  protection legislation. <br />- Otherwise, you will have to
                  provide a legal framework your transfers to ensure data
                  protection abroad.
                </span>
              }
            />
            <CheckboxField
              name="datatransfer"
              defaultIsChecked={
                procedure[3] != null ? procedure[3].datatransfer : false
              }
            >
              {({ fieldProps }) => (
                <Checkbox
                  {...fieldProps}
                  label={fieldPropsMapping['datatransfer']}
                />
              )}
            </CheckboxField>
            <Field
              aria-required={true}
              name="recipient"
              label={fieldPropsMapping['recipient']}
              defaultValue={procedure[3] && procedure[3].recipient}
              isRequired
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                  {!error && (
                    <HelperMessage>
                      Recipient is a natural or legal person, public authority,
                      agency or another body which the personal data are
                      disclosed.
                    </HelperMessage>
                  )}
                </Fragment>
              )}
            </Field>
            <Field<ValueType<RpaOption>>
              name="country"
              label={fieldPropsMapping['country']}
              defaultValue={procedure[3] && procedure[3].country}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a country'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.country}
                      validationState={error ? 'error' : 'default'}
                    />
                    {!error && (
                      <HelperMessage>Please select from the list</HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Field<ValueType<RpaOption, true>>
              name="guarantee"
              label={fieldPropsMapping['guarantee']}
              defaultValue={procedure[3] && procedure[3].guarantee}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select at least one'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.guarantee}
                      validationState={error ? 'error' : 'default'}
                      isMulti
                    />
                    {!error && (
                      <HelperMessage>
                        Multiple selection possible, and if None please specify
                        on the ticket
                      </HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Message
              appearance="warning"
              text={<span>Please attach relevant documents to the task.</span>}
            />
          </>
        )}
        {stage === 4 && (
          <>
            <Message
              appearance="warning"
              text={
                <span>
                  Secure your data:
                  <br />
                  - Ensure the integrity of your data assets by minimizing the
                  risk of data loss or hacking.
                  <br />
                  - The measures to be taken, whether electronic or physical,
                  depend on the sensitiveness of the data you are processing and
                  the risks to data subjects in the event of an incident. <br />
                  - Various actions must be implemented: updating your antivirus
                  and software, regularly changing passwords and adopting
                  complex passwords, or encrypting your data in certain
                  situations. In the event of loss or theft of an eletronic
                  device, it will be more difficult for a third party to access
                  it.
                </span>
              }
            />
            <Field<ValueType<RpaOption, true>>
              name="toms"
              label={fieldPropsMapping['toms']}
              defaultValue={procedure[4] && procedure[4].toms}
              aria-required={true}
              isRequired
              validate={async (value: any) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select at least one'
                );
              }}
            >
              {({ fieldProps: { id, ...rest }, error }) => (
                <Fragment>
                  <WithoutRing>
                    <Select
                      inputId={id}
                      {...rest}
                      options={config.toms}
                      validationState={error ? 'error' : 'default'}
                      isMulti
                    />
                    {!error && (
                      <HelperMessage>
                        Multiple selection possible, and if others please
                        specify on the ticket
                      </HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
            <Message
              appearance="warning"
              text="Please attach the relevant security certification and documents to the task."
            />
          </>
        )}
        {stage === 5 && (
          <>
            <Field
              label={fieldPropsMapping['involveProfiling']}
              name="involveProfiling"
              defaultValue={procedure[5]?.involveProfiling || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['involveProfiling']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['useAutomated']}
              name="useAutomated"
              defaultValue={procedure[5]?.useAutomated || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['useAutomated']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['involveSurveillance']}
              name="involveSurveillance"
              defaultValue={procedure[5]?.involveSurveillance || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['involveSurveillance']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['processedSpecialCategories']}
              name="processedSpecialCategories"
              defaultValue={procedure[5]?.processedSpecialCategories || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['processedSpecialCategories']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['isBigData']}
              name="isBigData"
              defaultValue={procedure[5]?.isBigData || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup {...fieldProps} options={config['isBigData']} />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['dataSetsCombined']}
              name="dataSetsCombined"
              defaultValue={procedure[5]?.dataSetsCombined || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['dataSetsCombined']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['multipleControllers']}
              name="multipleControllers"
              defaultValue={procedure[5]?.multipleControllers || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['multipleControllers']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['imbalanceInRelationship']}
              name="imbalanceInRelationship"
              defaultValue={procedure[5]?.imbalanceInRelationship || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['imbalanceInRelationship']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['innovativeTechnologyUsed']}
              name="innovativeTechnologyUsed"
              defaultValue={procedure[5]?.innovativeTechnologyUsed || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['innovativeTechnologyUsed']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['transferredOutside']}
              name="transferredOutside"
              defaultValue={procedure[5]?.transferredOutside || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['transferredOutside']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['rightsRestricted']}
              name="rightsRestricted"
              defaultValue={procedure[5]?.rightsRestricted || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup
                    {...fieldProps}
                    options={config['rightsRestricted']}
                  />
                </>
              )}
            </Field>
            <Field
              label={fieldPropsMapping['piaNeeded']}
              name="piaNeeded"
              defaultValue={procedure[5]?.piaNeeded || 'no'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <RadioGroup {...fieldProps} options={config['piaNeeded']} />
                </>
              )}
            </Field>
          </>
        )}
        <FormFooter></FormFooter>
      </div>
    </>
  );
};

export default CreateFormBody;
