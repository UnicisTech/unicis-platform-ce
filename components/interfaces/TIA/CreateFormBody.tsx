import React, { Fragment } from 'react';
import { DatePicker } from '@atlaskit/datetime-picker';
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select, { ValueType } from '@atlaskit/select';
import {
  Field,
  RangeField,
  FieldProps,
  FormFooter,
  HelperMessage,
  ErrorMessage,
} from '@atlaskit/form';
import Range from '@atlaskit/range';
import { RadioGroup } from '@atlaskit/radio';
import type { TiaOption } from 'types';
import { WithoutRing } from 'sharedStyles';
import { Message } from '@/components/shared/atlaskit';
import RiskLevel from './RiskLevel';
import TransferIs from './TransferIs';
import { format } from 'date-fns';
import {
  config,
  headers,
  fieldPropsMapping,
  questions,
} from '@/components/defaultLanding/data/configs/tia';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';

interface FormBodyProps {
  stage: number;
  validationMessage: string;
  procedure: any[];
  transferIs: string;
  targetedRisk: number;
  nonTargetedRisk: number;
  selfReportingRisk: number;
  isPermitted: boolean;
  procedureFieldHandler: (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (name: string, value: any) => void,
    stage: number
  ) => void;
  setFieldValue: (name: string, value: any) => void;
}

const СreateFormBody = ({
  stage,
  validationMessage,
  procedure,
  transferIs,
  targetedRisk,
  nonTargetedRisk,
  selfReportingRisk,
  isPermitted,
  procedureFieldHandler,
  setFieldValue,
}: FormBodyProps) => {
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
        <h3 className="text-1xl font-bold">{headers[stage]}</h3>
        <Message
          text={`Add a Transfer Impact Assessment if you are using the EU Standard Contractual Clauses (EU SCC) or under the other GDPR (or CH DPA) legal situations.
                    Transfer Impact Assessment (TIA) for use under the EU General Data Protection Regulation (GDPR) and Swiss Data Protection Act (CH DPA), including for complying with the EU Standard Contractual Clauses (EU SCC).`}
        />
        {stage === 0 && (
          <>
            <Message text={`To be completed by the exporter`} />
            {validationMessage && (
              <Message appearance="error" text={validationMessage} />
            )}

            <Field
              name="DataExporter"
              label={fieldPropsMapping['DataExporter']}
              defaultValue={procedure[0]?.DataExporter}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea
                    placeholder={`Specify the data exporter(s) or the sender in case of a relevant onward transfer`}
                    autoComplete="off"
                    {...fieldProps}
                  />
                </Fragment>
              )}
            </Field>

            <Field<ValueType<TiaOption>>
              name="CountryDataExporter"
              label={fieldPropsMapping['CountryDataExporter']}
              defaultValue={procedure[0]?.CountryDataExporter}
              aria-required={true}
              isRequired
              validate={async (value) => {
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
                      options={config.countries}
                      validationState={error ? 'error' : 'default'}
                    />
                    {error ? (
                      <ErrorMessage>{error}</ErrorMessage>
                    ) : (
                      <HelperMessage>Please select from the list</HelperMessage>
                    )}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>

            <Field
              name="DataImporter"
              label={fieldPropsMapping['DataImporter']}
              defaultValue={procedure[0]?.DataImporter}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea
                    placeholder={`Specify the data importer(s) or the sender in case of a relevant onward transfer`}
                    autoComplete="off"
                    {...fieldProps}
                  />
                </Fragment>
              )}
            </Field>

            <Field<ValueType<TiaOption>>
              name="CountryDataImporter"
              label={fieldPropsMapping['CountryDataImporter']}
              defaultValue={procedure[0]?.CountryDataImporter}
              aria-required={true}
              isRequired
              validate={async (value) => {
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
                      options={config.countries}
                      validationState={error ? 'error' : 'default'}
                    />
                    {error ? (
                      <ErrorMessage>{error}</ErrorMessage>
                    ) : (
                      <HelperMessage>Please select from the list</HelperMessage>
                    )}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>

            <Field
              name="TransferScenario"
              label={fieldPropsMapping['TransferScenario']}
              defaultValue={procedure[0]?.TransferScenario}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea
                    placeholder={`Description of the transfer scenario`}
                    autoComplete="off"
                    {...fieldProps}
                  />
                </Fragment>
              )}
            </Field>

            <Field
              name="DataAtIssue"
              label={fieldPropsMapping['DataAtIssue']}
              defaultValue={procedure[0]?.DataAtIssue}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea
                    placeholder={`Description of the data at issue`}
                    autoComplete="off"
                    {...fieldProps}
                  />
                </Fragment>
              )}
            </Field>

            <Field
              name="HowDataTransfer"
              label={fieldPropsMapping['HowDataTransfer']}
              defaultValue={procedure[0]?.HowDataTransfer}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea
                    placeholder={`Description how the data is transferred (e.g., remote access only), including any onward transfers`}
                    autoComplete="off"
                    {...fieldProps}
                  />
                </Fragment>
              )}
            </Field>

            <Field
              name="StartDateAssessment"
              label={fieldPropsMapping['StartDateAssessment']}
              defaultValue={
                procedure[0]?.StartDateAssessment ||
                format(new Date(), 'yyyy-MM-dd')
              }
              isRequired
              aria-required={true}
              validate={async (value) => {
                if (value) {
                  return undefined;
                }

                return new Promise((resolve) => setTimeout(resolve, 300)).then(
                  () => 'Please select a date'
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
                  {error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                  ) : (
                    <HelperMessage>
                      Starting date of the assessment
                    </HelperMessage>
                  )}
                </Fragment>
              )}
            </Field>

            <RangeField
              name="AssessmentYears"
              label={fieldPropsMapping['AssessmentYears']}
              defaultValue={procedure[0]?.AssessmentYears || 1}
            >
              {({ fieldProps }) => {
                console.log('fieldProps range', fieldProps);
                return (
                  <>
                    <Range min={1} max={10} step={1} {...fieldProps} />
                    <HelperMessage>
                      {`${fieldProps?.value} year${
                        fieldProps?.value > 1 ? 's' : ''
                      } (max. 10)`}
                    </HelperMessage>
                  </>
                );
              }}
            </RangeField>

            <Field<ValueType<TiaOption>>
              name="LawImporterCountry"
              label={fieldPropsMapping['LawImporterCountry']}
              defaultValue={procedure[0]?.LawImporterCountry}
              aria-required={true}
              isRequired
              validate={async (value) => {
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
                      options={config.countries}
                      validationState={error ? 'error' : 'default'}
                    />
                    {error ? (
                      <ErrorMessage>{error}</ErrorMessage>
                    ) : (
                      <HelperMessage>
                        Legal analysis on the lawful access laws of
                        importer&apos;s country
                      </HelperMessage>
                    )}
                  </WithoutRing>
                </Fragment>
              )}
            </Field>
          </>
        )}
        {stage === 1 && (
          <>
            <Message text={`To be completed by the exporter`} />

            <Field
              label={fieldPropsMapping['EncryptionInTransit']}
              name="EncryptionInTransit"
              defaultValue={procedure[1]?.EncryptionInTransit || 'yes'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <HelperMessage>
                    Is the personal data at issue protected with adequate
                    encryption in-transit (i.e. when transmitted)?v
                  </HelperMessage>
                  <RadioGroup
                    {...fieldProps}
                    options={config['EncryptionInTransit']}
                    onChange={(e) => {
                      procedureFieldHandler(e, setFieldValue, 1);
                    }}
                  />
                </>
              )}
            </Field>

            <Field
              name="ReasonEncryptionInTransit"
              label={fieldPropsMapping['ReasonEncryptionInTransit']}
              defaultValue={procedure[1]?.ReasonEncryptionInTransit}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              label={fieldPropsMapping['TransferMechanism']}
              name="TransferMechanism"
              defaultValue={procedure[1]?.TransferMechanism || 'yes'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <HelperMessage>
                    Is the personal data at issue protected by a transfer
                    mechanism approved by applicable data protection law (e.g.,
                    the EU Standard Contractual Clauses in case of the GDPR,
                    approved BCR, or - in the case of an onward transfer - a
                    back-to-back-contract in line with the EU SCC), and
                    compliance with it and its judicial enforcement be expected,
                    insofar permitted under the importer&apos;s law?
                  </HelperMessage>
                  <RadioGroup
                    {...fieldProps}
                    options={config['TransferMechanism']}
                    onChange={(e) => {
                      procedureFieldHandler(e, setFieldValue, 1);
                    }}
                  />
                </>
              )}
            </Field>

            <Field
              name="ReasonTransferMechanism"
              label={fieldPropsMapping['ReasonTransferMechanism']}
              defaultValue={procedure[1]?.ReasonTransferMechanism}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Message
              appearance="warning"
              text={`If the answer is NO please enter details into the EU Standard Contractual Clauses or similar safeguard!`}
            />

            <p className="font-bold">
              Based on the legal analysis above, the lawful access laws in the
              country of the importer are compatible with EU and CH law
            </p>

            <Field
              label={fieldPropsMapping['LawfulAccess']}
              name="LawfulAccess"
              defaultValue={procedure[1]?.LawfulAccess || 'yes'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <HelperMessage>
                    … in connection with targeted lawful access (e.g.,
                    investigations by the police, state prosecutors and other
                    authorities)
                  </HelperMessage>
                  <RadioGroup
                    {...fieldProps}
                    options={config['LawfulAccess']}
                    onChange={(e) => {
                      procedureFieldHandler(e, setFieldValue, 1);
                    }}
                  />
                </>
              )}
            </Field>

            <Field
              name="ReasonLawfulAccess"
              label={fieldPropsMapping['ReasonLawfulAccess']}
              defaultValue={procedure[1]?.ReasonLawfulAccess}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              label={fieldPropsMapping['MassSurveillanceTelecommunications']}
              name="MassSurveillanceTelecommunications"
              defaultValue={
                procedure[1]?.MassSurveillanceTelecommunications || 'yes'
              }
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <HelperMessage>
                    … in connection with mass surveillance of
                    telecommunications, online services, etc. (e.g., by
                    intelligence agencies)
                  </HelperMessage>
                  <RadioGroup
                    {...fieldProps}
                    options={config['MassSurveillanceTelecommunications']}
                    onChange={(e) => {
                      procedureFieldHandler(e, setFieldValue, 1);
                    }}
                  />
                </>
              )}
            </Field>

            <Field
              name="ReasonMassSurveillanceTelecommunications"
              label={
                fieldPropsMapping['ReasonMassSurveillanceTelecommunications']
              }
              defaultValue={
                procedure[1]?.ReasonMassSurveillanceTelecommunications
              }
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              label={fieldPropsMapping['SelfReportingObligations']}
              name="SelfReportingObligations"
              defaultValue={procedure[1]?.SelfReportingObligations || 'yes'}
            >
              {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                <>
                  <HelperMessage>
                    … in connection with self-reporting obligations
                  </HelperMessage>
                  <RadioGroup
                    {...fieldProps}
                    options={config['SelfReportingObligations']}
                    onChange={(e) => {
                      procedureFieldHandler(e, setFieldValue, 1);
                    }}
                  />
                </>
              )}
            </Field>

            <Field
              name="ReasonSelfReportingObligations"
              label={fieldPropsMapping['ReasonSelfReportingObligations']}
              defaultValue={procedure[1]?.ReasonSelfReportingObligations}
              aria-required={true}
              isRequired
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <TransferIs value={transferIs} />
          </>
        )}
        {stage === 2 && (
          <>
            <Message text={`To be completed by the importer`} />
            {procedure[1]?.LawfulAccess === 'no' ? (
              <>
                <Message
                  text={`Targeted lawful access (investigation): Risk of the importer (a) receiving a search warrant or subpoena (i.e. order to produce documents) from the police, a state prosecutor or other authority investigating a potential violation of local law or development of relevance for national security7), or (b) otherwise individually becoming subject of surveillance or other lawful access measures by these authorities as part of an investigation (e.g., its phone lines and Internet connections being intercepted or its cloud provider or ISP being required to produce the importer's messages or data); only those forms of lawful access need to be considered that were found to be incompatible with EU and CH law in the legal analysis`}
                />

                <Field
                  label={fieldPropsMapping['WarrantsSubpoenas']}
                  name="WarrantsSubpoenas"
                  defaultValue={procedure[2]?.WarrantsSubpoenas || '1'}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The local authorities in principle have the right to
                        issue to the importer or its providers warrants or
                        subpoenas as described above for the type of data at
                        issue
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['WarrantsSubpoenas']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonWarrantsSubpoenas"
                  label={fieldPropsMapping['ReasonWarrantsSubpoenas']}
                  defaultValue={procedure[2]?.ReasonWarrantsSubpoenas}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['ViolationLocalLaw']}
                  name="ViolationLocalLaw"
                  defaultValue={procedure[2]?.ViolationLocalLaw || '1'}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The local authorities issue such requests regardless of
                        whether they really believe that a violation of local
                        law has occured or that there is threat for national
                        security (e.g., for political reasons or as a scheme of
                        extortion)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['ViolationLocalLaw']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonViolationLocalLaw"
                  label={fieldPropsMapping['ReasonViolationLocalLaw']}
                  defaultValue={procedure[2]?.ReasonViolationLocalLaw}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['HighViolationLocalLaw']}
                  name="HighViolationLocalLaw"
                  defaultValue={procedure[2]?.HighViolationLocalLaw || '2'}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The data subjects (of the data at issue) have a high
                        probability of violating local laws and the data at
                        issue would be particularly interesting to investigate
                        these violations
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['HighViolationLocalLaw']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonHighViolationLocalLaw"
                  label={fieldPropsMapping['ReasonHighViolationLocalLaw']}
                  defaultValue={procedure[2]?.ReasonHighViolationLocalLaw}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['HighViolationDataIssue']}
                  name="HighViolationDataIssue"
                  defaultValue={procedure[2]?.HighViolationDataIssue || '2'}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The importer has a high probability of violating local
                        laws, and the data at issue would be particularly
                        interesting to investigate these violations
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['HighViolationDataIssue']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonHighViolationDataIssue"
                  label={fieldPropsMapping['ReasonHighViolationDataIssue']}
                  defaultValue={procedure[2]?.ReasonHighViolationDataIssue}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['InvestigatingImporter']}
                  name="InvestigatingImporter"
                  defaultValue={procedure[2]?.InvestigatingImporter || '2'}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        There are other reasons why the local authorities would
                        be interested in investigating the importer (e.g.,
                        because it is considered of relevance for national
                        security or economic espionage by the local government)
                        and, therefore, requesting the data at issue from the
                        importer or its providers
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['InvestigatingImporter']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonInvestigatingImporter"
                  label={fieldPropsMapping['ReasonInvestigatingImporter']}
                  defaultValue={procedure[2]?.ReasonInvestigatingImporter}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['PastWarrantSubpoena']}
                  name="PastWarrantSubpoena"
                  defaultValue={procedure[2]?.PastWarrantSubpoena || '3'}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        In the past 5-10 years, the importer was already
                        required to produce the type of data at issue following
                        such a warrant or subpoena from a local authority (or,
                        to the importer&apos;s best knowledge, one of its
                        providers was required to grant access to the
                        importer&apos;s data)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['PastWarrantSubpoena']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonPastWarrantSubpoena"
                  label={fieldPropsMapping['ReasonPastWarrantSubpoena']}
                  defaultValue={procedure[2]?.ReasonPastWarrantSubpoena}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <RiskLevel value={targetedRisk} />

                <Field
                  label={fieldPropsMapping['DataIssueInvestigation']}
                  name="DataIssueInvestigation"
                  defaultValue={procedure[2]?.DataIssueInvestigation}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        Based on the above and the legal analysis, does the
                        importer have reason to believe that during the
                        assessment period it (or one of its providers) will have
                        to produce some of the data at issue for an
                        investigation as described above?
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['DataIssueInvestigation']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonDataIssueInvestigation"
                  label={fieldPropsMapping['ReasonDataIssueInvestigation']}
                  defaultValue={procedure[2]?.ReasonDataIssueInvestigation}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                {procedure[2].DataIssueInvestigation === '2' ? (
                  <p>
                    <DaisyBadge appearance="removed">
                      Problematic Lawful Access expected!
                    </DaisyBadge>
                  </p>
                ) : null}
              </>
            ) : null}
            {procedure[1].MassSurveillanceTelecommunications === 'no' ? (
              <>
                <Message
                  isBold={true}
                  text={
                    'Non-targeted lawful access (mass surveillance):</Strong> Risk of the importer receiving a request of an intelligence agency or other authority to participate in the routine monitoring of communications or other data)'
                  }
                />

                <Field
                  label={fieldPropsMapping['LocalIssueWarrants']}
                  name="LocalIssueWarrants"
                  defaultValue={procedure[2]?.LocalIssueWarrants}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The local authorities in principle have the right to
                        issue to the importer warrants or subpoenas as described
                        above for the type of data at issue
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['LocalIssueWarrants']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonLocalIssueWarrants"
                  label={fieldPropsMapping['ReasonLocalIssueWarrants']}
                  defaultValue={procedure[2]?.ReasonLocalIssueWarrants}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['LocalMassSurveillance']}
                  name="LocalMassSurveillance"
                  defaultValue={procedure[2]?.LocalMassSurveillance}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The type of the data at issue is in principle of
                        interest for mass surveillance (e.g., because it
                        contains large volumes of third party communications or
                        third party communications that could be of relevance
                        for national security purposes)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['LocalMassSurveillance']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonLocalMassSurveillance"
                  label={fieldPropsMapping['ReasonLocalMassSurveillance']}
                  defaultValue={procedure[2]?.ReasonLocalMassSurveillance}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['LocalAccessMassSurveillance']}
                  name="LocalAccessMassSurveillance"
                  defaultValue={procedure[2]?.LocalAccessMassSurveillance}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The local authorities could consider the importer to be
                        a provider that has access to such type of data (e.g.,
                        because it is offering a corresponding service or is
                        contracted to process such data)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['LocalAccessMassSurveillance']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonLocalAccessMassSurveillance"
                  label={fieldPropsMapping['ReasonLocalAccessMassSurveillance']}
                  defaultValue={procedure[2]?.ReasonLocalAccessMassSurveillance}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['LocalRoutinelyMonitor']}
                  name="LocalRoutinelyMonitor"
                  defaultValue={procedure[2]?.LocalRoutinelyMonitor}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        There are other reasons why the local authorities would
                        be interested requiring the importer to routinely
                        monitor the data at issue for and on behalf of the
                        government (e.g., because it is considered of relevance
                        for national security or economic espionage by the local
                        government)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['LocalRoutinelyMonitor']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonLocalRoutinelyMonitor"
                  label={fieldPropsMapping['ReasonLocalRoutinelyMonitor']}
                  defaultValue={procedure[2]?.ReasonLocalRoutinelyMonitor}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['PassMassSurveillance']}
                  name="PassMassSurveillance"
                  defaultValue={procedure[2]?.PassMassSurveillance}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        In the past 5-10 years the importer was already required
                        to engage in mass surveillance for the local authorities
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['PassMassSurveillance']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonPassMassSurveillance"
                  label={fieldPropsMapping['ReasonPassMassSurveillance']}
                  defaultValue={procedure[2]?.ReasonPassMassSurveillance}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <RiskLevel value={nonTargetedRisk} />

                <Field
                  label={fieldPropsMapping['PassMassSurveillanceConnection']}
                  name="PassMassSurveillanceConnection"
                  defaultValue={procedure[2]?.PassMassSurveillanceConnection}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        Based on the above and the legal analysis, does the
                        importer have reason to believe that during the
                        assessment period it will have to produce some of the
                        data at issue in connection with such mass surveillance?
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['PassMassSurveillanceConnection']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonPassMassSurveillanceConnection"
                  label={
                    fieldPropsMapping['ReasonPassMassSurveillanceConnection']
                  }
                  defaultValue={
                    procedure[2]?.ReasonPassMassSurveillanceConnection
                  }
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                {procedure[2].PassMassSurveillanceConnection === '4' ? (
                  <p>
                    <DaisyBadge appearance="removed">
                      Problematic Lawful Access expected!
                    </DaisyBadge>
                  </p>
                ) : null}
              </>
            ) : (
              <></>
            )}
            {procedure[1].SelfReportingObligations === 'no' ? (
              <>
                <Message
                  isBold={true}
                  text={`Self-reporting to authorities:</Strong> Risk of the importer being required to self-report data to the public authorities for investigational purposes)`}
                />

                <Field
                  label={fieldPropsMapping['ImporterObligation']}
                  name="ImporterObligation"
                  defaultValue={procedure[2]?.ImporterObligation}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The importer could in principle be subject to such a
                        reporting obligation with regard to the type of data at
                        issue
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['ImporterObligation']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonImporterObligation"
                  label={fieldPropsMapping['ReasonImporterObligation']}
                  defaultValue={procedure[2]?.ReasonImporterObligation}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['LocalSelfReporting']}
                  name="LocalSelfReporting"
                  defaultValue={procedure[2]?.LocalSelfReporting}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        The data at issue typically contains information that is
                        subject to local self-reporting obligations (for the
                        purpose of permitting the local authorities to
                        investigate a matter; self-reporting obligations as part
                        of prudential supervision are not in-scope)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['LocalSelfReporting']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonLocalSelfReporting"
                  label={fieldPropsMapping['ReasonLocalSelfReporting']}
                  defaultValue={procedure[2]?.ReasonLocalSelfReporting}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  label={fieldPropsMapping['PastSelfReporting']}
                  name="PastSelfReporting"
                  defaultValue={procedure[2]?.PastSelfReporting}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        In the past 5-10 years the importer already
                        self-reported data of this type to the authorities
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['PastSelfReporting']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonPastSelfReporting"
                  label={fieldPropsMapping['ReasonPastSelfReporting']}
                  defaultValue={procedure[2]?.ReasonPastSelfReporting}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <RiskLevel value={selfReportingRisk} />

                <Field
                  label={fieldPropsMapping['AssessmentProduceReport']}
                  name="AssessmentProduceReport"
                  defaultValue={procedure[2]?.AssessmentProduceReport}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        Based on the above and the legal analysis, does the
                        importer have reason to believe that it will during the
                        assessment period have to produce the data at issue as
                        described above?
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['AssessmentProduceReport']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 2);
                        }}
                      />
                    </>
                  )}
                </Field>

                <Field
                  name="ReasonAssessmentProduceReport"
                  label={fieldPropsMapping['ReasonAssessmentProduceReport']}
                  defaultValue={procedure[2]?.ReasonAssessmentProduceReport}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                {procedure[2].AssessmentProduceReport === '4' ? (
                  <p>
                    <DaisyBadge appearance="removed">
                      Problematic Lawful Access expected!
                    </DaisyBadge>
                  </p>
                ) : null}
              </>
            ) : (
              <></>
            )}
          </>
        )}
        {stage === 3 && (
          <>
            <Message text={`To be completed by the exporter`} />
            <Message
              text={`If a problematic lawful access were to occur on the part of the importer as per Step 3, the transfer is nevertheless permitted if one of the derogations provided for by Art. 49 GDPR or the corresponding provisions of the CH DPA applies:`}
            />

            <p>{questions['DataTransferImporter']}</p>

            <Field
              name="RelevantDataTransferImporter"
              label={fieldPropsMapping['RelevantDataTransferImporter']}
              defaultValue={procedure[3]?.RelevantDataTransferImporter}
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ProbabilityDataTransferImporter"
              label={fieldPropsMapping['ProbabilityDataTransferImporter']}
              defaultValue={procedure[3]?.ProbabilityDataTransferImporter}
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ReasonDataTransferImporter"
              label={fieldPropsMapping['ReasonDataTransferImporter']}
              defaultValue={procedure[3]?.ReasonDataTransferImporter}
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <p>{questions['TransferToImporter']}</p>

            <Field
              name="RelevantTransferToImporter"
              label={fieldPropsMapping['RelevantTransferToImporter']}
              defaultValue={procedure[3]?.RelevantTransferToImporter}
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ProbabilityTransferToImporter"
              label={fieldPropsMapping['ProbabilityTransferToImporter']}
              defaultValue={procedure[3]?.ProbabilityTransferToImporter}
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ReasonTransferToImporter"
              label={fieldPropsMapping['ReasonTransferToImporter']}
              defaultValue={procedure[3]?.ReasonTransferToImporter}
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <p>{questions['TransferToImporterForPerformance']}</p>

            <Field
              name="RelevantTransferToImporterForPerformance"
              label={
                fieldPropsMapping['RelevantTransferToImporterForPerformance']
              }
              defaultValue={
                procedure[3]?.RelevantTransferToImporterForPerformance
              }
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ProbabilityTransferToImporterPerformance"
              label={
                fieldPropsMapping['ProbabilityTransferToImporterPerformance']
              }
              defaultValue={
                procedure[3]?.ProbabilityTransferToImporterPerformance
              }
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ReasonTransferToImporterPerformance"
              label={fieldPropsMapping['ReasonTransferToImporterPerformance']}
              defaultValue={procedure[3]?.ReasonTransferToImporterPerformance}
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <p>{questions['LegalGround']}</p>

            <Field
              name="RelevantLegalGround"
              label={fieldPropsMapping['RelevantLegalGround']}
              defaultValue={procedure[3]?.RelevantLegalGround}
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ProbabilityLegalGround"
              label={fieldPropsMapping['ProbabilityLegalGround']}
              defaultValue={procedure[3]?.ProbabilityLegalGround}
            >
              {({ fieldProps }) => (
                <Fragment>
                  <TextField autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <Field
              name="ReasonLegalGround"
              label={fieldPropsMapping['ReasonLegalGround']}
              defaultValue={procedure[3]?.ReasonLegalGround}
            >
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea autoComplete="off" {...fieldProps} />
                </Fragment>
              )}
            </Field>

            <p className="font-bold">Importer has reason to expect …</p>

            <p>
              <span>
                ... a problematic targeted lawful access concerning the data at
                issue?
                {procedure[2].DataIssueInvestigation === '2' ? (
                  <DaisyBadge appearance="added">Yes</DaisyBadge>
                ) : (
                  <DaisyBadge appearance="removed">No</DaisyBadge>
                )}
              </span>
            </p>
            <p>
              <span>
                ... a problematic mass surveillance involving the data at issue?
                {procedure[2].PassMassSurveillanceConnection === '4' ? (
                  <DaisyBadge appearance="added">Yes</DaisyBadge>
                ) : (
                  <DaisyBadge appearance="removed">No</DaisyBadge>
                )}
              </span>
            </p>
            <p>
              <span>
                ... a problematic self-reporting obligation (according to the
                Importer):
                {procedure[2].AssessmentProduceReport === '4' ? (
                  <DaisyBadge appearance="added">Yes</DaisyBadge>
                ) : (
                  <DaisyBadge appearance="removed">No</DaisyBadge>
                )}
              </span>
            </p>

            <Message
              text={`Based on the responses of the importer and the analysis done, does the exporter have reason to believe that (i) the importer will during the assessment period have to produce the data at issue) and (ii) it will be unable to justify such lawful access by way of one of the derogations of Art. 49 GDPR ...)`}
            />

            {procedure[1].LawfulAccess === 'no' ? (
              <>
                <Field
                  label={fieldPropsMapping['ConnectionTargetedAccess']}
                  name="ConnectionTargetedAccess"
                  defaultValue={procedure[3]?.ConnectionTargetedAccess}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        (e.g., investigations by the police, state prosecutors
                        and other authorities)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['ConnectionTargetedAccess']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 3);
                        }}
                      />
                    </>
                  )}
                </Field>
                <Field
                  name="ReasonConnectionTargetedAccess"
                  label={fieldPropsMapping['ReasonConnectionTargetedAccess']}
                  defaultValue={procedure[3]?.ReasonConnectionTargetedAccess}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
              </>
            ) : null}

            {procedure[1].MassSurveillanceTelecommunications === 'no' ? (
              <>
                <Field
                  label={fieldPropsMapping['ConnectionSurveillanceTele']}
                  name="ConnectionSurveillanceTele"
                  defaultValue={procedure[3]?.ConnectionSurveillanceTele}
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        (e.g., by intelligence agencies)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['ConnectionSurveillanceTele']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 3);
                        }}
                      />
                    </>
                  )}
                </Field>
                <Field
                  name="ReasonConnectionSurveillanceTele"
                  label={fieldPropsMapping['ReasonConnectionSurveillanceTele']}
                  defaultValue={procedure[3]?.ReasonConnectionSurveillanceTele}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
              </>
            ) : null}

            {procedure[1].SelfReportingObligations === 'no' ? (
              <>
                <Field
                  label={
                    fieldPropsMapping['ConnectionSelfreportingObligations']
                  }
                  name="ConnectionSelfreportingObligations"
                  defaultValue={
                    procedure[3]?.ConnectionSelfreportingObligations
                  }
                >
                  {({ fieldProps }: { fieldProps: FieldProps<string> }) => (
                    <>
                      <HelperMessage>
                        (e.g., by intelligence agencies)
                      </HelperMessage>
                      <RadioGroup
                        {...fieldProps}
                        options={config['ConnectionSelfreportingObligations']}
                        onChange={(e) => {
                          procedureFieldHandler(e, setFieldValue, 3);
                        }}
                      />
                    </>
                  )}
                </Field>
                <Field
                  name="ReasonConnectionSelfreportingObligations"
                  label={
                    fieldPropsMapping[
                      'ReasonConnectionSelfreportingObligations'
                    ]
                  }
                  defaultValue={
                    procedure[3]?.ReasonConnectionSelfreportingObligations
                  }
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
              </>
            ) : null}
          </>
        )}
        {stage === 4 && (
          <>
            <Message text={`To be completed by the exporter`} />

            <p>
              <span className="font-bold">
                In view of the above and applicable data protection laws, the
                transfer is:
              </span>
              {isPermitted ? (
                <DaisyBadge appearance="added">PERMITTED</DaisyBadge>
              ) : (
                <DaisyBadge appearance="removed">NOT PERMITTED</DaisyBadge>
              )}
            </p>
          </>
        )}
        <FormFooter></FormFooter>
      </div>
    </>
  );
};

export default СreateFormBody;
