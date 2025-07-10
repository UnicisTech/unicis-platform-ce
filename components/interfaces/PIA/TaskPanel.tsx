import React, { useState } from 'react'
import { headers, fieldPropsMapping } from '@/components/defaultLanding/data/configs/pia'
import { Field } from '@/components/shared/atlaskit'
import RiskMatrixBubbleChart from './RiskMatrixBubbleChart'
import { riskSecurityPoints, riskProbabilityPoints } from '@/components/defaultLanding/data/configs/pia'
import type { Task } from '@prisma/client'
import { PiaRisk, TaskProperties } from 'types'

const tabFieldKeys: Record<number, Array<any>> = {
  0: [
    'isDataProcessingNecessary',
    'isDataProcessingNecessaryAssessment',
    'isProportionalToPurpose',
    'isProportionalToPurposeAssessment',
  ],
  1: [
    'confidentialityRiskProbability',
    'confidentialityRiskSecurity',
    'confidentialityAssessment',
  ],
  2: [
    'availabilityRiskProbability',
    'availabilityRiskSecurity',
    'availabilityAssessment',
  ],
  3: [
    'transparencyRiskProbability',
    'transparencyRiskSecurity',
    'transparencyAssessment',
  ],
  4: [
    'guarantees',
    'securityMeasures',
    'securityCompliance',
    'dealingWithResidualRisk',
    'dealingWithResidualRiskAssessment',
    'supervisoryAuthorityInvolvement',
  ],
}

const FieldTab: React.FC<{ idx: number; risk: PiaRisk }> = ({ idx, risk }) => (
  <>
    {tabFieldKeys[idx].map((key) => (
      <Field
        key={key as string}
        label={fieldPropsMapping[key]}
        value={(risk[idx] as any)[key]}
      />
    ))}
  </>
)

const BubbleChartTab: React.FC<{ risk: PiaRisk }> = ({ risk }) => (
  <div style={{ minHeight: '200px', width: '100%' }}>
    <RiskMatrixBubbleChart
      datasets={[
        {
          label: 'Confidentiality and Integrity Risk',
          borderWidth: 1,
          data: [
            {
              x: riskSecurityPoints[risk[1].confidentialityRiskSecurity],
              y: riskProbabilityPoints[risk[1].confidentialityRiskProbability],
              r: 20,
            },
          ],
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        {
          label: 'Availability',
          borderWidth: 1,
          data: [
            {
              x: riskSecurityPoints[risk[2].availabilityRiskSecurity],
              y: riskProbabilityPoints[risk[2].availabilityRiskProbability],
              r: 20,
            },
          ],
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        {
          label: 'Transparency and data minimization',
          borderWidth: 1,
          data: [
            {
              x: riskSecurityPoints[risk[3].transparencyRiskSecurity],
              y: riskProbabilityPoints[risk[3].transparencyRiskProbability],
              r: 20,
            },
          ],
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
      ]}
    />
  </div>
)

const TiaPanel: React.FC<{ task: Task }> = ({ task }) => {
  const [activeTab, setActiveTab] = useState(0)
  const properties = task.properties as TaskProperties
  const risk = properties.pia_risk as PiaRisk

  const tabs = [
    <FieldTab key="0" idx={0} risk={risk} />,
    <FieldTab key="1" idx={1} risk={risk} />,
    <FieldTab key="2" idx={2} risk={risk} />,
    <FieldTab key="3" idx={3} risk={risk} />,
    <BubbleChartTab key="4" risk={risk} />,
    <FieldTab key="5" idx={4} risk={risk} />,
  ]

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold mb-4">
        View Privacy Impact Assessment
      </h2>

      {risk ? (
        <div className="w-full">
          <div role="tablist" className="tabs tabs-bordered">
            {headers.map((header, i) => {
              // skip tab 5 if there's no risk[4]
              if (i === 5 && !risk[4]) return null
              return (
                <button
                  key={i}
                  role="tab"
                  className={`tab ${activeTab === i ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {header}
                </button>
              )
            })}
          </div>

          <div className="mt-4 space-y-3">{tabs[activeTab]}</div>
        </div>
      ) : (
        <div className="my-4">
          <p>Risk has not been created for this task.</p>
        </div>
      )}
    </div>
  )
}

export default TiaPanel