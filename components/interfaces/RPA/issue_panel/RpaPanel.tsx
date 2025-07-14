import React, { useState } from 'react';
import {
  headers,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';
import { RpaProcedureInterface } from 'types';

const RpaPanel = ({ task }: { task: Task }) => {
  const properties = task?.properties as any;
  const procedure = properties?.rpa_procedure as RpaProcedureInterface;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-5">
      <h2 className="text-base font-bold mb-4">View Register of Procedures</h2>
      {procedure ? (
        <>
          <div role="tablist" className="tabs tabs-bordered mb-4">
            {headers.map((header, index) => (
              <button
                key={index}
                role="tab"
                className={`tab ${activeTab === index ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {header}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 0 && (
              <div className="space-y-2">
                <Field
                  label={fieldPropsMapping['reviewDate']}
                  value={procedure[0].reviewDate}
                />
                <Field
                  label={fieldPropsMapping['controller']}
                  value={procedure[0].controller}
                />
                <Field
                  label={fieldPropsMapping['dpo']}
                  value={procedure[0].dpo.label}
                />
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-2">
                {procedure[1].purpose && (
                  <Field
                    label={fieldPropsMapping['purpose']}
                    value={procedure[1].purpose}
                  />
                )}
                <Field
                  label={fieldPropsMapping['category']}
                  value={procedure[1].category
                    .map(({ label }) => label)
                    .join(', ')}
                />
                <Field
                  label={fieldPropsMapping['specialcategory']}
                  value={procedure[1].specialcategory
                    .map(({ label }) => label)
                    .join(', ')}
                />
                <Field
                  label={fieldPropsMapping['datasubject']}
                  value={procedure[1].datasubject
                    .map(({ label }) => label)
                    .join(', ')}
                />
                <Field
                  label={fieldPropsMapping['retentionperiod']}
                  value={procedure[1].retentionperiod.label}
                />
                {procedure[1].commentsretention && (
                  <Field
                    label={fieldPropsMapping['commentsretention']}
                    value={procedure[1].commentsretention}
                  />
                )}
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-2">
                <Field
                  label={fieldPropsMapping['recipientType']}
                  value={procedure[2].recipientType.label}
                />
                {procedure[2].recipientdetails && (
                  <Field
                    label={fieldPropsMapping['recipientdetails']}
                    value={procedure[2].recipientdetails}
                  />
                )}
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-2">
                <Field
                  label={fieldPropsMapping['datatransfer']}
                  value={procedure[3].datatransfer ? 'Enabled' : 'Disabled'}
                />
                <Field
                  label={fieldPropsMapping['recipient']}
                  value={procedure[3].recipient}
                />
                <Field
                  label={fieldPropsMapping['country']}
                  value={procedure[3].country.label}
                />
                <Field
                  label={fieldPropsMapping['guarantee']}
                  value={procedure[3].guarantee
                    .map(({ label }) => label)
                    .join(', ')}
                />
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-2">
                <Field
                  label={fieldPropsMapping['toms']}
                  value={procedure[4].toms.map(({ label }) => label).join(', ')}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-xs">
            Procedure has not been created for this issue.
          </p>
        </div>
      )}
    </div>
  );
};

export default RpaPanel;
