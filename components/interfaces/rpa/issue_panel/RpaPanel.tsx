import React, { useState, useMemo } from 'react';
import {
  headers,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';
import { RpaProcedureInterface } from 'types';

const DescriptionAndStakeholdersTab: React.FC<{
  step: RpaProcedureInterface[0];
}> = ({ step }) => (
  <div className="space-y-2">
    <Field label={fieldPropsMapping.reviewDate} value={step.reviewDate} />
    <Field label={fieldPropsMapping.controller} value={step.controller} />
    <Field label={fieldPropsMapping.dpo} value={step.dpo.label} />
  </div>
);

const PurposeAndCategoriesTab: React.FC<{ step: RpaProcedureInterface[1] }> = ({
  step,
}) => (
  <div className="space-y-2">
    {step.purpose && (
      <Field label={fieldPropsMapping.purpose} value={step.purpose} />
    )}
    <Field
      label={fieldPropsMapping.category}
      value={step.category.map(({ label }) => label).join(', ')}
    />
    <Field
      label={fieldPropsMapping.specialcategory}
      value={step.specialcategory.map(({ label }) => label).join(', ')}
    />
    <Field
      label={fieldPropsMapping.datasubject}
      value={step.datasubject.map(({ label }) => label).join(', ')}
    />
    <Field
      label={fieldPropsMapping.retentionperiod}
      value={step.retentionperiod.label}
    />
    {step.commentsretention && (
      <Field
        label={fieldPropsMapping.commentsretention}
        value={step.commentsretention}
      />
    )}
  </div>
);

const RecipientsTab: React.FC<{ step: RpaProcedureInterface[2] }> = ({
  step,
}) => (
  <div className="space-y-2">
    <Field
      label={fieldPropsMapping.recipientType}
      value={step.recipientType.label}
    />
    {step.recipientdetails && (
      <Field
        label={fieldPropsMapping.recipientdetails}
        value={step.recipientdetails}
      />
    )}
  </div>
);

const TiaTab: React.FC<{ step: RpaProcedureInterface[3] }> = ({ step }) => (
  <div className="space-y-2">
    <Field
      label={fieldPropsMapping.datatransfer}
      value={step.datatransfer ? 'Enabled' : 'Disabled'}
    />
    <Field label={fieldPropsMapping.recipient} value={step.recipient} />
    <Field label={fieldPropsMapping.country} value={step.country.label} />
    <Field
      label={fieldPropsMapping.guarantee}
      value={step.guarantee.map(({ label }) => label).join(', ')}
    />
  </div>
);

const SecurityMeasuresTab: React.FC<{ step: RpaProcedureInterface[4] }> = ({
  step,
}) => (
  <div className="space-y-2">
    <Field
      label={fieldPropsMapping.toms}
      value={step.toms.map(({ label }) => label).join(', ')}
    />
  </div>
);

const RpaPanel: React.FC<{ task: Task }> = ({ task }) => {
  const properties = task.properties as any;
  const procedure = properties.rpa_procedure as RpaProcedureInterface;
  const [activeTab, setActiveTab] = useState(0);

  // Build tabs array
  const tabs = useMemo(
    () =>
      procedure
        ? [
            <DescriptionAndStakeholdersTab key={0} step={procedure[0]} />,
            <PurposeAndCategoriesTab key={1} step={procedure[1]} />,
            <RecipientsTab key={2} step={procedure[2]} />,
            <TiaTab key={3} step={procedure[3]} />,
            <SecurityMeasuresTab key={4} step={procedure[4]} />,
          ]
        : [],
    [procedure]
  );

  const hasProcedure = tabs.length > 0;

  return (
    <div className="p-5">
      <h2 className="text-base font-bold mb-4">View Register of Procedures</h2>
      {hasProcedure ? (
        <>
          <div role="tablist" className="tabs tabs-bordered">
            {headers.slice(0, -1).map((header, index) => (
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

          <div className="mt-4">{tabs[activeTab]}</div>
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
