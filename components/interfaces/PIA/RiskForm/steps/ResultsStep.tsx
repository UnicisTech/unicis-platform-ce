'use client';

import * as React from 'react';
import {
  riskSecurityPoints,
  riskProbabilityPoints,
} from '@/components/defaultLanding/data/configs/pia';
import RiskMatrixBubbleChart from '../../RiskMatrixBubbleChart';
import type { PiaRisk } from 'types';

const Results = ({ risk }: { risk: PiaRisk }) => (
  <>
    <p>a) Confidentiality and Integrity</p>
    <RiskMatrixBubbleChart
      datasets={[
        {
          label: 'Confidentiality and Integrity Risk',
          borderWidth: 1,
          data: [
            {
              x: riskSecurityPoints[risk[1].confidentialityRiskSecurity],
              y: riskProbabilityPoints[risk[1].confidentialityRiskProbability],
              r: 15,
            },
          ],
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
      ]}
    />
    <p>b) Availability</p>
    <RiskMatrixBubbleChart
      datasets={[
        {
          label: 'Availability',
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
    <p>c) Transparency, purpose limitation and data minimization</p>
    <RiskMatrixBubbleChart
      datasets={[
        {
          label: 'Transparency, purpose limitation and data minimization',
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

export default Results;
