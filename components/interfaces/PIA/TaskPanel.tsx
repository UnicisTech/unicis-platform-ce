import React from 'react';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import { IssuePanelContainer } from 'sharedStyles';
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

const TiaPanel = ({ task }: { task: Task }) => {
  const properties = task?.properties as TaskProperties;
  const risk = properties?.pia_risk as PiaRisk | undefined;

  return (
    <IssuePanelContainer>
      <h2 className="text-1xl font-bold">View Privacy Impact Assessment</h2>
      {risk ? (
        <Tabs id="default">
          <TabList>
            <Tab>{headers[0]}</Tab>
            <Tab>{headers[1]}</Tab>
            <Tab>{headers[2]}</Tab>
            <Tab>{headers[3]}</Tab>
            <Tab>{headers[4]}</Tab>
            {risk[4] && <Tab>{headers[5]}</Tab>}
          </TabList>
          <TabPanel>
            <div>
              <Field
                label={fieldPropsMapping['isDataProcessingNecessary']}
                value={risk[0]?.isDataProcessingNecessary}
              />
              <Field
                label={fieldPropsMapping['isDataProcessingNecessaryAssessment']}
                value={risk[0]?.isDataProcessingNecessaryAssessment}
              />
              <Field
                label={fieldPropsMapping['isProportionalToPurpose']}
                value={risk[0]?.isProportionalToPurpose}
              />
              <Field
                label={fieldPropsMapping['isProportionalToPurposeAssessment']}
                value={risk[0]?.isProportionalToPurposeAssessment}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div>
              <Field
                label={fieldPropsMapping['confidentialityRiskProbability']}
                value={risk[1]?.confidentialityRiskProbability}
              />
              <Field
                label={fieldPropsMapping['confidentialityRiskSecurity']}
                value={risk[1]?.confidentialityRiskSecurity}
              />
              <Field
                label={fieldPropsMapping['confidentialityAssessment']}
                value={risk[1]?.confidentialityAssessment}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div>
              <Field
                label={fieldPropsMapping['availabilityRiskProbability']}
                value={risk[2]?.availabilityRiskProbability}
              />
              <Field
                label={fieldPropsMapping['availabilityRiskSecurity']}
                value={risk[2]?.availabilityRiskSecurity}
              />
              <Field
                label={fieldPropsMapping['availabilityAssessment']}
                value={risk[2]?.availabilityAssessment}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div>
              <Field
                label={fieldPropsMapping['transparencyRiskProbability']}
                value={risk[3]?.transparencyRiskProbability}
              />
              <Field
                label={fieldPropsMapping['transparencyRiskSecurity']}
                value={risk[3]?.transparencyRiskSecurity}
              />
              <Field
                label={fieldPropsMapping['transparencyAssessment']}
                value={risk[3]?.transparencyAssessment}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{ minHeight: '200px', width: '100%' }}>
              <RiskMatrixBubbleChart
                datasets={[
                  {
                    label: 'Confidentiality and Integrity Risk',
                    borderWidth: 1,
                    data: [
                      {
                        x: riskSecurityPoints[
                          risk[1].confidentialityRiskSecurity
                        ],
                        y: riskProbabilityPoints[
                          risk[1].confidentialityRiskProbability
                        ],
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
                        y: riskProbabilityPoints[
                          risk[2].availabilityRiskProbability
                        ],
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
                        y: riskProbabilityPoints[
                          risk[3].transparencyRiskProbability
                        ],
                        r: 20,
                      },
                    ],
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                ]}
              />
            </div>
          </TabPanel>
          {risk[4] && (
            <TabPanel>
              <div>
                <Field
                  label={fieldPropsMapping['guarantees']}
                  value={risk[4]?.guarantees}
                />
                <Field
                  label={fieldPropsMapping['securityMeasures']}
                  value={risk[4]?.securityMeasures}
                />
                <Field
                  label={fieldPropsMapping['securityCompliance']}
                  value={risk[4]?.securityCompliance}
                />
                <Field
                  label={fieldPropsMapping['dealingWithResidualRisk']}
                  value={risk[4]?.dealingWithResidualRisk}
                />
                <Field
                  label={fieldPropsMapping['dealingWithResidualRiskAssessment']}
                  value={risk[4]?.dealingWithResidualRiskAssessment}
                />
                <Field
                  label={fieldPropsMapping['supervisoryAuthorityInvolvement']}
                  value={risk[4]?.supervisoryAuthorityInvolvement}
                />
              </div>
            </TabPanel>
          )}
        </Tabs>
      ) : (
        <div style={{ margin: '10px 0px' }}>
          <p>Risk has not been created for this task.</p>
        </div>
      )}
    </IssuePanelContainer>
  );
};

export default TiaPanel;
