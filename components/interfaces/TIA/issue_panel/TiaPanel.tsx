import React, { useState, useEffect } from 'react';
import { SimpleTag as Tag } from '@atlaskit/tag';
import Badge from '@atlaskit/badge';
import { IssuePanelContainer } from 'sharedStyles';
import {
  config,
  headers,
  fieldPropsMapping,
  questions,
} from '@/components/defaultLanding/data/configs/tia';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';
import { TiaProcedureInterface } from 'types';
import RiskLevel from '../RiskLevel';

const TiaPanel = ({ task }: { task: Task }) => {
  const properties = task?.properties as any;
  const procedure = properties?.tia_procedure as TiaProcedureInterface;

  const [targetedRisk, setTargetedRisk] = useState<number>(0);
  const [nonTargetedRisk, setNonTargetedRisk] = useState<number>(0);
  const [selfReportingRisk, setSelfReportingRisk] = useState<number>(0);
  const [isPermitted, setIsPermitted] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const NOT_APLICABLE = 'Not Applicable';

  useEffect(() => {
    if (!procedure) return;

    if (procedure[2]) {
      const {
        WarrantsSubpoenas,
        ViolationLocalLaw,
        HighViolationLocalLaw,
        HighViolationDataIssue,
        InvestigatingImporter,
        PastWarrantSubpoena,
        LocalIssueWarrants,
        LocalMassSurveillance,
        LocalAccessMassSurveillance,
        LocalRoutinelyMonitor,
        PassMassSurveillance,
        ImporterObligation,
        LocalSelfReporting,
        PastSelfReporting,
      } = procedure[2];

      const targetedRisk =
        Number(WarrantsSubpoenas) +
        Number(ViolationLocalLaw) +
        Number(HighViolationLocalLaw) +
        Number(HighViolationDataIssue) +
        Number(InvestigatingImporter) +
        Number(PastWarrantSubpoena);

      const nonTargetedRisk =
        Number(LocalIssueWarrants) +
        Number(LocalMassSurveillance) +
        Number(LocalAccessMassSurveillance) +
        Number(LocalRoutinelyMonitor) +
        Number(PassMassSurveillance);

      const selfReportingRisk =
        Number(ImporterObligation) +
        Number(LocalSelfReporting) +
        Number(PastSelfReporting);

      setTargetedRisk(targetedRisk);
      setNonTargetedRisk(nonTargetedRisk);
      setSelfReportingRisk(selfReportingRisk);
    }
  }, [procedure]);

  useEffect(() => {
    if (!procedure) return;

    if (procedure[1]) {
      const {
        EncryptionInTransit,
        TransferMechanism,
        LawfulAccess,
        MassSurveillanceTelecommunications,
        SelfReportingObligations,
      } = procedure[1];

      const {
        ConnectionTargetedAccess,
        ConnectionSurveillanceTele,
        ConnectionSelfreportingObligations,
      } = procedure[3];

      if (EncryptionInTransit === 'no' || TransferMechanism === 'no') {
        return setIsPermitted(false);
      }

      if (LawfulAccess === 'no' && ConnectionTargetedAccess === 'yes') {
        return setIsPermitted(false);
      }

      if (
        MassSurveillanceTelecommunications === 'no' &&
        ConnectionSurveillanceTele === 'yes'
      ) {
        return setIsPermitted(false);
      }

      if (
        SelfReportingObligations === 'no' &&
        ConnectionSelfreportingObligations === 'yes'
      ) {
        return setIsPermitted(false);
      }

      setIsPermitted(true);
    }
  }, [procedure]);

  const renderPanel = () => {
    switch (selectedTab) {
      case 0:
        return (
<div>
              <Field
                label={fieldPropsMapping['DataExporter']}
                value={procedure[0].DataExporter}
              />
              <Field
                label={fieldPropsMapping['CountryDataExporter']}
                value={procedure[0].CountryDataExporter.label}
              />
              <Field
                label={fieldPropsMapping['DataImporter']}
                value={procedure[0].DataImporter}
              />
              <Field
                label={fieldPropsMapping['CountryDataImporter']}
                value={procedure[0].CountryDataImporter.label}
              />
              <Field
                label={fieldPropsMapping['TransferScenario']}
                value={procedure[0].TransferScenario}
              />
              <Field
                label={fieldPropsMapping['DataAtIssue']}
                value={procedure[0].DataAtIssue}
              />
              <Field
                label={fieldPropsMapping['HowDataTransfer']}
                value={procedure[0].HowDataTransfer}
              />
              <Field
                label={fieldPropsMapping['StartDateAssessment']}
                value={<Tag text={procedure[0].StartDateAssessment} />}
              />
              <Field
                label={fieldPropsMapping['HowDataTransfer']}
                value={procedure[0].HowDataTransfer}
              />
              <Field
                label={fieldPropsMapping['AssessmentYears']}
                value={procedure[0].AssessmentYears}
              />
              <Field
                label={fieldPropsMapping['LawImporterCountry']}
                value={procedure[0].LawImporterCountry.label}
              />
            </div>
        );
      case 1:
        return (
          <div>
            <Field
              label={fieldPropsMapping['EncryptionInTransit']}
              value={
                config['EncryptionInTransit'].find(
                  ({ value }) => value === procedure[1].EncryptionInTransit
                )?.label || ''
              }
            />
            <Field
              label={fieldPropsMapping['ReasonEncryptionInTransit']}
              value={procedure[1].ReasonEncryptionInTransit}
            />
            <Field
              label={fieldPropsMapping['TransferMechanism']}
              value={
                config['TransferMechanism'].find(
                  ({ value }) => value === procedure[1].TransferMechanism
                )?.label || ''
              }
            />
            <Field
              label={fieldPropsMapping['ReasonTransferMechanism']}
              value={procedure[1].ReasonTransferMechanism}
            />
            <Field
              label={fieldPropsMapping['LawfulAccess']}
              value={
                config['LawfulAccess'].find(
                  ({ value }) => value === procedure[1].LawfulAccess
                )?.label || ''
              }
            />
            <Field
              label={fieldPropsMapping['ReasonLawfulAccess']}
              value={procedure[1].ReasonLawfulAccess}
            />
            <Field
              label={fieldPropsMapping['MassSurveillanceTelecommunications']}
              value={
                config['MassSurveillanceTelecommunications'].find(
                  ({ value }) =>
                    value === procedure[1].MassSurveillanceTelecommunications
                )?.label || ''
              }
            />
            <Field
              label={
                fieldPropsMapping['ReasonMassSurveillanceTelecommunications']
              }
              value={procedure[1].ReasonMassSurveillanceTelecommunications}
            />
            <Field
              label={fieldPropsMapping['SelfReportingObligations']}
              value={
                config['SelfReportingObligations'].find(
                  ({ value }) =>
                    value === procedure[1].SelfReportingObligations
                )?.label || ''
              }
            />
            <Field
              label={
                fieldPropsMapping['ReasonMassSurveillanceTelecommunications']
              }
              value={procedure[1].ReasonMassSurveillanceTelecommunications}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <Field
              label={fieldPropsMapping['WarrantsSubpoenas']}
              value={
                config['WarrantsSubpoenas'].find(
                  ({ value }) => value === procedure[2].WarrantsSubpoenas
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={
                fieldPropsMapping['ReasonMassSurveillanceTelecommunications']
              }
              value={procedure[2].ReasonWarrantsSubpoenas || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['ViolationLocalLaw']}
              value={
                config['ViolationLocalLaw'].find(
                  ({ value }) => value === procedure[2].ViolationLocalLaw
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonViolationLocalLaw']}
              value={procedure[2].ReasonViolationLocalLaw || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['HighViolationLocalLaw']}
              value={
                config['HighViolationLocalLaw'].find(
                  ({ value }) => value === procedure[2].HighViolationLocalLaw
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonHighViolationLocalLaw']}
              value={
                procedure[2].ReasonHighViolationLocalLaw || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['HighViolationDataIssue']}
              value={
                config['HighViolationDataIssue'].find(
                  ({ value }) => value === procedure[2].HighViolationDataIssue
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonHighViolationDataIssue']}
              value={
                procedure[2].ReasonHighViolationDataIssue || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['InvestigatingImporter']}
              value={
                config['InvestigatingImporter'].find(
                  ({ value }) => value === procedure[2].InvestigatingImporter
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonInvestigatingImporter']}
              value={
                procedure[2].ReasonInvestigatingImporter || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['PastWarrantSubpoena']}
              value={
                config['PastWarrantSubpoena'].find(
                  ({ value }) => value === procedure[2].PastWarrantSubpoena
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonPastWarrantSubpoena']}
              value={procedure[2].ReasonPastWarrantSubpoena || NOT_APLICABLE}
            />
            <RiskLevel value={targetedRisk} />
            <Field
              label={fieldPropsMapping['DataIssueInvestigation']}
              value={
                config['DataIssueInvestigation'].find(
                  ({ value }) => value === procedure[2].DataIssueInvestigation
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonDataIssueInvestigation']}
              value={
                procedure[2].ReasonDataIssueInvestigation || NOT_APLICABLE
              }
            />

            <Field
              label={fieldPropsMapping['LocalIssueWarrants']}
              value={
                config['LocalIssueWarrants'].find(
                  ({ value }) => value === procedure[2].LocalIssueWarrants
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonLocalIssueWarrants']}
              value={procedure[2].ReasonLocalIssueWarrants || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['LocalMassSurveillance']}
              value={
                config['LocalMassSurveillance'].find(
                  ({ value }) => value === procedure[2].LocalMassSurveillance
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonLocalMassSurveillance']}
              value={
                procedure[2].ReasonLocalMassSurveillance || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['LocalAccessMassSurveillance']}
              value={
                config['LocalAccessMassSurveillance'].find(
                  ({ value }) =>
                    value === procedure[2].LocalAccessMassSurveillance
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonLocalAccessMassSurveillance']}
              value={
                procedure[2].ReasonLocalAccessMassSurveillance ||
                NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['LocalRoutinelyMonitor']}
              value={
                config['LocalRoutinelyMonitor'].find(
                  ({ value }) => value === procedure[2].LocalRoutinelyMonitor
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonLocalRoutinelyMonitor']}
              value={
                procedure[2].ReasonLocalRoutinelyMonitor || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['PassMassSurveillance']}
              value={
                config['PassMassSurveillance'].find(
                  ({ value }) => value === procedure[2].PassMassSurveillance
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonPassMassSurveillance']}
              value={procedure[2].ReasonPassMassSurveillance || NOT_APLICABLE}
            />
            <RiskLevel value={nonTargetedRisk} />
            <Field
              label={fieldPropsMapping['PassMassSurveillanceConnection']}
              value={
                config['PassMassSurveillanceConnection'].find(
                  ({ value }) =>
                    value === procedure[2].PassMassSurveillanceConnection
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={
                fieldPropsMapping['ReasonPassMassSurveillanceConnection']
              }
              value={
                procedure[2].ReasonPassMassSurveillanceConnection ||
                NOT_APLICABLE
              }
            />

            <Field
              label={fieldPropsMapping['ImporterObligation']}
              value={
                config['ImporterObligation'].find(
                  ({ value }) => value === procedure[2].ImporterObligation
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonImporterObligation']}
              value={procedure[2].ReasonImporterObligation || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['LocalSelfReporting']}
              value={
                config['LocalSelfReporting'].find(
                  ({ value }) => value === procedure[2].LocalSelfReporting
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonLocalSelfReporting']}
              value={procedure[2].ReasonLocalSelfReporting || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['PastSelfReporting']}
              value={
                config['PastSelfReporting'].find(
                  ({ value }) => value === procedure[2].PastSelfReporting
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonPastSelfReporting']}
              value={procedure[2].ReasonPastSelfReporting || NOT_APLICABLE}
            />
            <RiskLevel value={selfReportingRisk} />
            <Field
              label={fieldPropsMapping['AssessmentProduceReport']}
              value={
                config['AssessmentProduceReport'].find(
                  ({ value }) =>
                    value === procedure[2].AssessmentProduceReport
                )?.label || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonAssessmentProduceReport']}
              value={
                procedure[2].ReasonAssessmentProduceReport || NOT_APLICABLE
              }
            />
          </div>
        );
      case 3:
        return (
          <div>
            <Field label={questions['DataTransferImporter']} />
            <Field
              label={fieldPropsMapping['RelevantDataTransferImporter']}
              value={
                procedure[3].RelevantDataTransferImporter || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ProbabilityDataTransferImporter']}
              value={
                procedure[3].ProbabilityDataTransferImporter || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonDataTransferImporter']}
              value={procedure[3].ReasonDataTransferImporter || NOT_APLICABLE}
            />

            <Field label={questions['TransferToImporter']} />
            <Field
              label={fieldPropsMapping['RelevantTransferToImporter']}
              value={procedure[3].RelevantTransferToImporter || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['ProbabilityTransferToImporter']}
              value={
                procedure[3].ProbabilityTransferToImporter || NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonTransferToImporter']}
              value={procedure[3].ReasonTransferToImporter || NOT_APLICABLE}
            />

            <Field label={questions['TransferToImporterForPerformance']} />
            <Field
              label={
                fieldPropsMapping['RelevantTransferToImporterForPerformance']
              }
              value={
                procedure[3].RelevantTransferToImporterForPerformance ||
                NOT_APLICABLE
              }
            />
            <Field
              label={
                fieldPropsMapping['ProbabilityTransferToImporterPerformance']
              }
              value={
                procedure[3].ProbabilityTransferToImporterPerformance ||
                NOT_APLICABLE
              }
            />
            <Field
              label={fieldPropsMapping['ReasonTransferToImporterPerformance']}
              value={
                procedure[3].ReasonTransferToImporterPerformance ||
                NOT_APLICABLE
              }
            />

            <Field label={questions['LegalGround']} />
            <Field
              label={fieldPropsMapping['RelevantLegalGround']}
              value={procedure[3].RelevantLegalGround || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['ProbabilityLegalGround']}
              value={procedure[3].ProbabilityLegalGround || NOT_APLICABLE}
            />
            <Field
              label={fieldPropsMapping['ReasonLegalGround']}
              value={procedure[3].ReasonLegalGround || NOT_APLICABLE}
            />
          </div>
        );
      case 4:
        return (
          <div>
            <Field
              label="In view of the above and applicable data protection laws, the transfer is"
              value={
                isPermitted ? (
                  <Badge appearance="added">PERMITTED</Badge>
                ) : (
                  <Badge appearance="removed">NOT PERMITTED</Badge>
                )
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <IssuePanelContainer>
      <h2 className="text-1xl font-bold mb-4">View Transfer Impact Assessment</h2>
      {procedure ? (
        <div>
          <div role="tablist" className="tabs tabs-bordered">
            {headers.map((header, idx) => (
              <button
                key={idx}
                role="tab"
                className={`tab ${selectedTab === idx ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab(idx)}
              >
                {header}
              </button>
            ))}
          </div>
          <div className="mt-4">{renderPanel()}</div>
        </div>
      ) : (
        <div className="mt-2">
          <p>Procedure has not been created for this issue.</p>
        </div>
      )}
    </IssuePanelContainer>
  );
};

export default TiaPanel;
