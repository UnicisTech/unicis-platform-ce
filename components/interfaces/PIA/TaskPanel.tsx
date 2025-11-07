import React, { useState } from 'react';
import {
  headers,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/pia';
import { Field } from '@/components/shared/atlaskit';
import RiskMatrixBubbleChart from './RiskMatrixBubbleChart';
import {
  riskSecurityPoints,
  riskProbabilityPoints,
} from '@/components/defaultLanding/data/configs/pia';
import type { Task } from '@prisma/client';
import { PiaRisk, TaskProperties } from 'types';
import { useTranslation } from 'next-i18next';

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
};

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
);

const BubbleChartTab: React.FC<{ risk: PiaRisk }> = ({ risk }) => {
  const { t } = useTranslation('common');
  return (
    <div className="min-h-[200px] w-full">
      <RiskMatrixBubbleChart
        datasets={[
          {
            label: t('confidentiality-and-integrity-risk'),
            borderWidth: 1,
            data: [
              {
                x: riskSecurityPoints[risk[1].confidentialityRiskSecurity],
                y: riskProbabilityPoints[
                  risk[1].confidentialityRiskProbability
                ],
                r: 20,
              },
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          {
            label: t('availability'),
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
            label: t('transparency-and-data-minimization'),
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
  );
};

const PiaPanel: React.FC<{ task: Task }> = ({ task }) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(0);
  const properties = task.properties as TaskProperties;
  const risk = properties.pia_risk as PiaRisk;

  const tabs = risk
    ? [
        <FieldTab key="0" idx={0} risk={risk} />,
        <FieldTab key="1" idx={1} risk={risk} />,
        <FieldTab key="2" idx={2} risk={risk} />,
        <FieldTab key="3" idx={3} risk={risk} />,
        <BubbleChartTab key="4" risk={risk} />,
        <FieldTab key="5" idx={4} risk={risk} />,
      ]
    : [];

  const hasRisk = tabs.length > 0;

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold mb-4">
        {t('view-privacy-impact-assessment')}
      </h2>

      {hasRisk ? (
        <div className="w-full">
          <div role="tablist" className="tabs tabs-bordered">
            {headers.map((header, i) => {
              if (i === 5 && !risk[4]) return null;
              return (
                <button
                  key={i}
                  role="tab"
                  className={`tab ${activeTab === i ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {header}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">{tabs[activeTab]}</div>
        </div>
      ) : (
        <div className="my-4">
          <p>{t('risk-has-not-been-created-for-this-task')}</p>
        </div>
      )}
    </div>
  );
};

export default PiaPanel;
