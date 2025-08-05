import React, { useState, useMemo } from 'react'
import {
  config,
  headers,
  fieldPropsMapping,
  questions,
} from '@/components/defaultLanding/data/configs/tia'
import { Field } from '@/components/shared/atlaskit'
import type { Task } from '@prisma/client'
import { TiaProcedureInterface } from 'types'
import RiskLevel from '../RiskLevel'
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge'
import { getTiaRisks, isTranferPermitted } from '@/lib/tia'

const NOT_APPLICABLE = 'Not Applicable'

const TransferScenarioTab: React.FC<{ step: TiaProcedureInterface[0] }> = ({ step }) => (
  <div>
    <Field label={fieldPropsMapping.DataExporter} value={step.DataExporter} />
    <Field label={fieldPropsMapping.CountryDataExporter} value={step.CountryDataExporter.label} />
    <Field label={fieldPropsMapping.DataImporter} value={step.DataImporter} />
    <Field label={fieldPropsMapping.CountryDataImporter} value={step.CountryDataImporter.label} />
    <Field label={fieldPropsMapping.TransferScenario} value={step.TransferScenario} />
    <Field label={fieldPropsMapping.DataAtIssue} value={step.DataAtIssue} />
    <Field label={fieldPropsMapping.HowDataTransfer} value={step.HowDataTransfer} />
    <Field
      label={fieldPropsMapping.StartDateAssessment}
      value={<DaisyBadge color="tag">{step.StartDateAssessment}</DaisyBadge>}
    />
    <Field label={fieldPropsMapping.AssessmentYears} value={step.AssessmentYears} />
    <Field
      label={fieldPropsMapping.LawImporterCountry}
      value={step.LawImporterCountry.label}
    />
  </div>
)

const ProblematicLawfulAccessTab: React.FC<{ step: TiaProcedureInterface[1] }> = ({ step }) => (
  <div>
    {(['EncryptionInTransit', 'TransferMechanism', 'LawfulAccess', 'MassSurveillanceTelecommunications', 'SelfReportingObligations'] as const).map((key) => {
      const option = config[key].find((o) => o.value === (step as any)[key])
      return (
        <Field
          key={key}
          label={fieldPropsMapping[key]}
          value={option?.label || ''}
        />
      )
    })}
    {(['ReasonEncryptionInTransit', 'ReasonTransferMechanism', 'ReasonLawfulAccess', 'ReasonMassSurveillanceTelecommunications', 'ReasonSelfReportingObligations'] as const).map((key) => (
      <Field
        key={key}
        label={fieldPropsMapping[key]}
        value={(step as any)[key] || ''}
      />
    ))}
  </div>
)

const RiskTab: React.FC<{
  step: TiaProcedureInterface[2]
  targetedRisk: number
  nonTargetedRisk: number
  selfReportingRisk: number
}> = ({ step, targetedRisk, nonTargetedRisk, selfReportingRisk }) => (
  <div>
    {Object.entries(step).map(([key, val]) => {
      if (key.startsWith('Reason')) return null
      const label = fieldPropsMapping[key as keyof typeof fieldPropsMapping]
      const display = config[key]?.find((o) => o.value === val)?.label || val || NOT_APPLICABLE
      return <Field key={key} label={label} value={display} />
    })}

    <RiskLevel value={targetedRisk} />
    <RiskLevel value={nonTargetedRisk} />
    <RiskLevel value={selfReportingRisk} />
  </div>
)

// Tab 3: Detailed questions
const ProbabilityTab: React.FC<{ step: TiaProcedureInterface[3] }> = ({ step }) => (
  <div>
    {Object.entries(questions).map(([qKey, qLabel]) => {
      const propKey = Object.keys(fieldPropsMapping).find(
        (k) => fieldPropsMapping[k] === qLabel
      ) as keyof typeof fieldPropsMapping
      return (
        <React.Fragment key={qKey}>
          <Field label={qLabel} />
          <Field
            label={fieldPropsMapping[propKey]}
            value={(step as any)[propKey] || NOT_APPLICABLE}
          />
        </React.Fragment>
      )
    })}
  </div>
)

// Tab 4: Final decision
const ConclusionTab: React.FC<{ permitted: boolean }> = ({ permitted }) => (
  <div>
    <Field
      label="Transfer decision"
      value={
        permitted ? (
          <DaisyBadge appearance="added">PERMITTED</DaisyBadge>
        ) : (
          <DaisyBadge appearance="removed">NOT PERMITTED</DaisyBadge>
        )
      }
    />
  </div>
)

const TiaPanel: React.FC<{ task: Task }> = ({ task }) => {
  const properties = task.properties as any
  const procedure = properties.tia_procedure as TiaProcedureInterface
  const [selectedTab, setSelectedTab] = useState(0)

  const { targetedRisk, nonTargetedRisk, selfReportingRisk } = useMemo(() => {
    return getTiaRisks(procedure?.[2])
  }, [procedure])


  const isPermitted = useMemo(
    () => isTranferPermitted(procedure),
    [procedure]
  )

  const tabs = [
    <TransferScenarioTab key={0} step={procedure[0]} />,
    <ProblematicLawfulAccessTab key={1} step={procedure[1]} />,
    <RiskTab
      key={2}
      step={procedure[2]}
      targetedRisk={targetedRisk}
      nonTargetedRisk={nonTargetedRisk}
      selfReportingRisk={selfReportingRisk}
    />,
    <ProbabilityTab key={3} step={procedure[3]} />,
    <ConclusionTab key={4} permitted={isPermitted} />,
  ]

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold mb-4">View Transfer Impact Assessment</h2>
      {procedure ? (
        <>
          <div role="tablist" className="tabs tabs-bordered">
            {headers.map((hdr, idx) => (
              <button
                key={idx}
                role="tab"
                className={`tab ${selectedTab === idx ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab(idx)}
              >
                {hdr}
              </button>
            ))}
          </div>
          <div className="mt-4">{tabs[selectedTab]}</div>
        </>
      ) : (
        <div className="mt-2">
          <p>Procedure has not been created for this issue.</p>
        </div>
      )}
    </div>
  )
}

export default TiaPanel