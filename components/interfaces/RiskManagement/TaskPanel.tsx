import React from 'react';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import { IssuePanelContainer } from 'sharedStyles';
import {
    headers,
    fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rm';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';
import { RMProcedureInterface, TaskProperties } from 'types';

const RmTaskPanel = ({ task }: { task: Task }) => {
    const properties = task?.properties as TaskProperties;
    const risk = properties?.rm_risk as RMProcedureInterface | undefined;

    return (
        <IssuePanelContainer>
            <h2 className="text-1xl font-bold">View Risk Management</h2>
            {risk ? (
                <Tabs
                    id="default"
                >
                    <TabList>
                        <Tab>{headers[0]}</Tab>
                        <Tab>{headers[1]}</Tab>
                    </TabList>
                    <TabPanel>
                        <div>
                            <Field
                                label={fieldPropsMapping['Risk']}
                                value={risk[0]?.Risk}
                            />
                            <Field
                                label={fieldPropsMapping['AssetOwner']}
                                value={risk[0]?.AssetOwner?.label}
                            />
                            <Field
                                label={fieldPropsMapping['Impact']}
                                value={risk[0]?.Impact}
                            />
                            <Field
                                label={fieldPropsMapping['RawProbability']}
                                value={`${risk[0]?.RawProbability}%`}
                            />
                            <Field
                                label={fieldPropsMapping['RawImpact']}
                                value={`${risk[0]?.RawImpact}%`}
                            />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div>
                            <Field
                                label={fieldPropsMapping['RiskTreatment']}
                                value={risk[1]?.RiskTreatment}
                            />
                            <Field
                                label={fieldPropsMapping['TreatmentCost']}
                                value={risk[1]?.TreatmentCost}
                            />
                            <Field
                                label={fieldPropsMapping['TreatmentStatus']}
                                value={`${risk[1]?.TreatmentStatus}%`}
                            />
                            <Field
                                label={fieldPropsMapping['TreatedProbability']}
                                value={`${risk[1]?.TreatedProbability}%`}
                            />
                            <Field
                                label={fieldPropsMapping['TreatedImpact']}
                                value={`${risk[1]?.TreatedImpact}%`}
                            />
                        </div>
                    </TabPanel>
                </Tabs>
            ) : (
                <div style={{ margin: '10px 0px' }}>
                    <p>Risk has not been created for this task.</p>
                </div>
            )}
        </IssuePanelContainer>
    );
};

export default RmTaskPanel;
