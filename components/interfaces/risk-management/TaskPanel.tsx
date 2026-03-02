import React, { useState } from 'react';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from '@/generated/browser';
import { RMProcedureInterface, TaskProperties } from 'types';
import { useTranslation } from 'next-i18next';
import { steps } from '@/lib/rm';
import useTeamMembersMap from 'hooks/useTeamMembersMap';
import { Error, Loading, MemberName } from '@/components/shared';
import { riskValueToLabelKey } from '@/lib/common';

const RmTaskPanel = ({ task, slug }: { task: Task; slug: string }) => {
  const { t } = useTranslation('common');
  const properties = task?.properties as TaskProperties;
  const risk = properties?.rm_risk as RMProcedureInterface | undefined;
  const [activeTab, setActiveTab] = useState(0);

  const { isLoading, isError, membersById } = useTeamMembersMap(slug);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError?.message} />;
  }

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold mb-4">{t('view-risk-management')}</h2>
      {risk ? (
        <>
          <div role="tablist" className="tabs tabs-bordered">
            <button
              role="tab"
              className={`tab ${activeTab === 0 ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              {t(`rm:steps.${steps[0]}`)}
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === 1 ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              {t(`rm:steps.${steps[1]}`)}
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 0 && (
              <div>
                <Field label={t(`rm:fields.Risk`)} value={risk[0]?.Risk} />
                <Field
                  label={t(`rm:fields.AssetOwner`)}
                  value={
                    <MemberName
                      userId={risk[0]?.AssetOwner}
                      membersById={membersById}
                      fallback={t('not-found')}
                    />
                  }
                />
                <Field label={t(`rm:fields.Impact`)} value={risk[0]?.Impact} />
                <Field
                  label={t(`rm:fields.RawProbability`)}
                  value={`${t(riskValueToLabelKey(risk[0]?.RawProbability))} (${risk[0]?.RawProbability}%)`}
                />
                <Field
                  label={t(`rm:fields.RawImpact`)}
                  value={`${t(riskValueToLabelKey(risk[0]?.RawImpact))} (${risk[0]?.RawImpact}%)`}
                />
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <Field
                  label={t(`rm:fields.RiskTreatment`)}
                  value={risk[1]?.RiskTreatment}
                />
                <Field
                  label={t(`rm:fields.TreatmentCost`)}
                  value={risk[1]?.TreatmentCost}
                />
                <Field
                  label={t(`rm:fields.TreatmentStatus`)}
                  value={`${t(riskValueToLabelKey(risk[1]?.TreatmentStatus))} (${risk[1]?.TreatmentStatus}%)`}
                />
                <Field
                  label={t(`rm:fields.TreatedProbability`)}
                  value={`${t(riskValueToLabelKey(risk[1]?.TreatedProbability))} (${risk[1]?.TreatedProbability}%)`}
                />
                <Field
                  label={t(`rm:fields.TreatedImpact`)}
                  value={`${t(riskValueToLabelKey(risk[1]?.TreatedImpact))} (${risk[1]?.TreatedImpact}%)`}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-4">
          <p>{t('risk-has-not-been-created-for-this-task')}</p>
        </div>
      )}
    </div>
  );
};

export default RmTaskPanel;
