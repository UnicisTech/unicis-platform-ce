import React, { useState } from 'react';
import {
  headers,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rm';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';
import { RMProcedureInterface, TaskProperties } from 'types';
import { riskValueToLabel } from '@/lib/rm';

const RmTaskPanel = ({ task }: { task: Task }) => {
  const properties = task?.properties as TaskProperties;
  const risk = properties?.rm_risk as RMProcedureInterface | undefined;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold mb-4">View Risk Management</h2>
      {risk ? (
        <>
          <div role="tablist" className="tabs tabs-bordered">
            <button
              role="tab"
              className={`tab ${activeTab === 0 ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              {headers[0]}
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === 1 ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              {headers[1]}
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 0 && (
              <div>
                <Field label={fieldPropsMapping['Risk']} value={risk[0]?.Risk} />
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
                  value={`${riskValueToLabel(risk[0]?.RawProbability)} (${risk[0]?.RawProbability}%)`}
                />
                <Field
                  label={fieldPropsMapping['RawImpact']}
                  value={`${riskValueToLabel(risk[0]?.RawImpact)} (${risk[0]?.RawImpact}%)`}
                />
              </div>
            )}
            {activeTab === 1 && (
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
                  value={`${riskValueToLabel(risk[1]?.TreatmentStatus)} (${risk[1]?.TreatmentStatus}%)`}
                />
                <Field
                  label={fieldPropsMapping['TreatedProbability']}
                  value={`${riskValueToLabel(risk[1]?.TreatedProbability)} (${risk[1]?.TreatedProbability}%)`}
                />
                <Field
                  label={fieldPropsMapping['TreatedImpact']}
                  value={`${riskValueToLabel(risk[1]?.TreatedImpact)} (${risk[1]?.TreatedImpact}%)`}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-4">
          <p>Risk has not been created for this task.</p>
        </div>
      )}
    </div>
  );
};

export default RmTaskPanel;
