import * as React from 'react';
import {
  riskSecurityPoints,
  riskProbabilityPoints,
} from '@/components/defaultLanding/data/configs/pia';
import RiskMatrixBubbleChart from '../../RiskMatrixBubbleChart';
import type { PiaRisk } from 'types';
import { useTranslation } from 'next-i18next';

const Results = ({ risk }: { risk: PiaRisk }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <p>{t('a-confidentiality-and-integrity')}</p>
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
                r: 15,
              },
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        ]}
      />

      <p>{t('b-availability')}</p>
      <RiskMatrixBubbleChart
        datasets={[
          {
            label: t('availability'),
            borderWidth: 1,
            data: [
              {
                x: riskSecurityPoints[risk[2].availabilityRiskSecurity],
                y: riskProbabilityPoints[risk[2].availabilityRiskProbability],
                r: 15,
              },
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        ]}
      />

      <p>{t('c-transparency-purpose-limitation-and-data-minimization')}</p>
      <RiskMatrixBubbleChart
        datasets={[
          {
            label: t('transparency-purpose-limitation-and-data-minimization'),
            borderWidth: 1,
            data: [
              {
                x: riskSecurityPoints[risk[3].transparencyRiskSecurity],
                y: riskProbabilityPoints[risk[3].transparencyRiskProbability],
                r: 15,
              },
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        ]}
      />
    </>
  );
};

export default Results;
