import React from 'react'
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import { IssuePanelContainer } from 'sharedStyles';
import { headers, fieldPropsMapping } from '../config';
import Field from './Field';
import type { Task } from "@prisma/client";
import { RpaProcedureInterface } from 'types';

const RpaPanel = ({
  task
}: {
  task: Task
}) => {
  const properties = task?.properties as any
  const procedure = properties?.rpa_procedure as RpaProcedureInterface

  return (
    <IssuePanelContainer>
      <h2 className="text-1xl font-bold">View Register of Procedures</h2>
      {procedure
        ? <Tabs
            onChange={(index) => console.log('Selected Tab', index + 1)}
            id="default"
          >
            <TabList>
              <Tab>{headers[0]}</Tab>
              <Tab>{headers[1]}</Tab>
              <Tab>{headers[2]}</Tab>
              <Tab>{headers[3]}</Tab>
              <Tab>{headers[4]}</Tab>
            </TabList>
            <TabPanel>
              <div>
                <Field
                  label={fieldPropsMapping["reviewDate"]}
                  value={procedure[0].reviewDate}
                />
                <Field
                  label={fieldPropsMapping["controller"]}
                  value={procedure[0].controller}
                />
                <Field
                  label={fieldPropsMapping["dpo"]}
                  value={procedure[0].dpo.label}
                />
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                {procedure[1].purpose &&
                  <Field
                    label={fieldPropsMapping["purpose"]}
                    value={procedure[1].purpose}
                  />
                }
                <Field
                  label={fieldPropsMapping["category"]}
                  value={procedure[1].category.map(({ label }) => label).join(', ')}
                />
                <Field
                  label={fieldPropsMapping["specialcategory"]}
                  value={procedure[1].specialcategory.map(({ label }) => label).join(', ')}
                />
                <Field
                  label={fieldPropsMapping["datasubject"]}
                  value={procedure[1].datasubject.map(({ label }) => label).join(', ')}
                />
                <Field
                  label={fieldPropsMapping["retentionperiod"]}
                  value={procedure[1].retentionperiod.label}
                />
                {procedure[1].commentsretention &&
                  <Field
                    label={fieldPropsMapping["commentsretention"]}
                    value={procedure[1].commentsretention}
                  />
                }
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <Field
                  label={fieldPropsMapping["recipientType"]}
                  value={procedure[2].recipientType.label}
                />
                {procedure[2].recipientdetails &&
                  <Field
                    label={fieldPropsMapping["recipientdetails"]}
                    value={procedure[2].recipientdetails}
                  />
                }
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <Field
                  label={fieldPropsMapping["datatransfer"]}
                  value={procedure[3].datatransfer ? "Enabled" : "Disabled"}
                />
                <Field
                  label={fieldPropsMapping["recipient"]}
                  value={procedure[3].recipient}
                />
                <Field
                  label={fieldPropsMapping["country"]}
                  value={procedure[3].country.label}
                />
                <Field
                  label={fieldPropsMapping["guarantee"]}
                  value={procedure[3].guarantee.map(({ label }) => label).join(', ')}
                />
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <Field
                  label={fieldPropsMapping["toms"]}
                  value={procedure[4].toms.map(({ label }) => label).join(', ')}
                />
              </div>
            </TabPanel>
          </Tabs>
        : <div style={{margin: '10px 0px'}}>
            <p>Procedure has not been created for this issue.</p>
          </div>
      }

    </IssuePanelContainer>
  )
}

export default RpaPanel