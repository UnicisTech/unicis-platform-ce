import React, { useState } from 'react';
import { Field } from '@/components/shared/atlaskit';
import RiskMatrixBubbleChart from './RiskMatrixBubbleChart';
import { riskSecurityPoints, riskProbabilityPoints } from '@/lib/pia';
import type { Task } from 'types';
import { PiaRisk, TaskProperties } from 'types';
import { useTranslation } from 'next-i18next';
import { steps } from '@/lib/pia';

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

const FieldTab: React.FC<{ idx: number; risk: PiaRisk }> = ({ idx, risk }) => {
  const { t } = useTranslation('common');

  return (
    <>
      {tabFieldKeys[idx].map((key) => (
        <Field
          key={key as string}
          label={t(`pia:fields.${key}`)}
          value={(risk[idx] as any)[key]}
        />
      ))}
    </>
  );
};

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

// const DataProcessingTab: React.FC<{ step: PiaRisk[0] }> = ({
//   step,
// }) => {
//   const { t } = useTranslation('common');
//   return (
//       <div className="space-y-2">
//         <Field
//           label={t(`pia:fields.isDataProcessingNecessary`)}
//           value={t(`pia:isDataProcessingNecessary.${step.isDataProcessingNecessary}`)}
//         />
//         <Field
//           label={t(`pia:fields.isDataProcessingNecessaryAssessment`)}
//           value={step.isDataProcessingNecessaryAssessment}
//         />
//         <Field
//           label={t(`pia:fields.isProportionalToPurpose`)}
//           value={t(`pia:isProportionalToPurpose.${step.isProportionalToPurpose}`)}
//         />
//         <Field
//           label={t(`pia:fields.isProportionalToPurposeAssessment`)}
//           value={step.isProportionalToPurposeAssessment}
//         />
//       </div>
//     )
// }

// const ConfidentialityTab: React.FC<{ step: PiaRisk[1] }> = ({
//   step,
// }) => {
//   const { t } = useTranslation('common');
//   return (
//       <div className="space-y-2">
//         <Field
//           label={t(`pia:fields.confidentialityRiskProbability`)}
//           value={t(`pia:risk-probability.${step.confidentialityRiskProbability}`)}
//         />
//         <Field
//           label={t(`pia:fields.confidentialityRiskSecurity`)}
//           value={t(`pia:confidentialityRiskSecurity.${step.confidentialityRiskSecurity}`)}
//         />
//         <Field
//           label={t(`pia:fields.confidentialityAssessment`)}
//           value={step.confidentialityAssessment}
//         />
//       </div>
//     )
// }

const PiaPanel: React.FC<{ task: Task }> = ({ task }) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(0);
  const properties = task.properties as TaskProperties;
  const risk = properties.pia_risk as PiaRisk;

  const tabs = risk
    ? [
        <FieldTab key="0" idx={0} risk={risk} />,
        // <DataProcessingTab step={risk[0]}/>,
        // <ConfidentialityTab step={risk[1]}/>,
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
            {steps.map((step, i) => {
              if (i === 5 && !risk[4]) return null;
              return (
                <button
                  key={i}
                  id={`pia-tab-${i}`}
                  role="tab"
                  aria-selected={activeTab === i}
                  aria-controls="pia-tab-panel"
                  className={`tab ${activeTab === i ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {t(`pia:steps.${step}`)}
                </button>
              );
            })}
          </div>

          <div
            id="pia-tab-panel"
            role="tabpanel"
            aria-labelledby={`pia-tab-${activeTab}`}
            className="mt-4 space-y-3"
          >
            {tabs[activeTab]}
          </div>
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
