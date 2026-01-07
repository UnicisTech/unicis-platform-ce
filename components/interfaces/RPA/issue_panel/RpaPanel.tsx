import React, { useState, useMemo } from 'react';
import { steps } from '@/lib/rpa';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from '@prisma/client';
import { RpaProcedureInterface } from 'types';
import { useTranslation } from 'next-i18next';
import useTeamMembers from 'hooks/useTeamMembers';
import { Error, Loading } from '@/components/shared';

const DescriptionAndStakeholdersTab: React.FC<{
  step: RpaProcedureInterface[0];
  slug: string;
}> = ({ step, slug }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, members } = useTeamMembers(slug)

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !members) {
    return <Error message={isError?.message} />;
  }

  const dpoName = members.find(member => member.userId === step.dpo)?.user.name || t('not-found')

  return (
    <div className="space-y-2">
      <Field label={t(`rpa:fields.reviewDate`)} value={step.reviewDate} />
      <Field label={t(`rpa:fields.controller`)} value={step.controller} />
      <Field label={t(`rpa:fields.dpo`)} value={dpoName} />
    </div>
  )
};

const PurposeAndCategoriesTab: React.FC<{ step: RpaProcedureInterface[1] }> = ({
  step,
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="space-y-2">
      {step.purpose && (
        <Field label={t(`rpa:fields.purpose`)} value={step.purpose} />
      )}
      <Field
        label={t(`rpa:fields.category`)}
        value={step.category.map(item => t(`rpa:category.${item}`)).join(', ')}
      />
      <Field
        label={t(`rpa:fields.specialcategory`)}
        value={step.specialcategory.map(item => t(`rpa:special-category.${item}`)).join(', ')}
      />
      <Field
        label={t(`rpa:fields.datasubject`)}
        value={step.datasubject.map(item => t(`rpa:data-subject.${item}`)).join(', ')}
      />
      <Field
        label={t(`rpa:fields.retentionperiod`)}
        value={t(`rpa:retention-period.${step.retentionperiod}`)}
      />
      {step.commentsretention && (
        <Field
          label={t(`rpa:fields.commentsretention`)}
          value={step.commentsretention}
        />
      )}
    </div>
  )
};

const RecipientsTab: React.FC<{ step: RpaProcedureInterface[2] }> = ({
  step,
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="space-y-2">
      <Field
        label={t(`rpa:fields.recipientType`)}
        value={t(`rpa:recipient-type.${step.recipientType}`)}
      />
      {step.recipientdetails && (
        <Field
          label={t(`rpa:fields.recipientdetails`)}
          value={step.recipientdetails}
        />
      )}
    </div>
  )
};

const TiaTab: React.FC<{ step: RpaProcedureInterface[3] }> = ({ step }) => {
  const { t } = useTranslation('common');
  return (
    <div className="space-y-2">
      <Field
        label={t(`rpa:fields.datatransfer`)}
        value={step.datatransfer ? t('enabled') : t('disabled')}
      />
      <Field label={t(`rpa:fields.recipient`)} value={step.recipient} />
      <Field label={t(`rpa:fields.country`)} value={t(`country.${step.country}`)} />
      <Field
        label={t(`rpa:fields.guarantee`)}
        value={step.guarantee.map(item => t(`rpa:guarantee.${item}`)).join(', ')}
      />
    </div>
  );
};

const SecurityMeasuresTab: React.FC<{ step: RpaProcedureInterface[4] }> = ({
  step,
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="space-y-2">
      <Field
        label={t(`rpa:fields.toms`)}
        value={step.toms.map(item => t(`rpa:toms.${item}`)).join(', ')}
      />
    </div>   
  )
};

const RpaPanel: React.FC<{ task: Task, slug: string }> = ({ task, slug }) => {
  const { t } = useTranslation('common');
  const properties = task.properties as any;
  const procedure = properties.rpa_procedure as RpaProcedureInterface;
  const [activeTab, setActiveTab] = useState(0);

  const tabs = useMemo(
    () =>
      procedure
        ? [
            <DescriptionAndStakeholdersTab key={0} step={procedure[0]} slug={slug} />,
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
      <h2 className="text-base font-bold mb-4">
        {t('view-register-of-procedures')}
      </h2>
      {hasProcedure ? (
        <>
          <div role="tablist" className="tabs tabs-bordered">
            {steps.slice(0, -1).map((step, index) => (
              <button
                key={index}
                role="tab"
                className={`tab ${activeTab === index ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {t(`rpa:steps.${step}`)}
              </button>
            ))}
          </div>

          <div className="mt-4">{tabs[activeTab]}</div>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-xs">
            {t('procedure-has-not-been-created-for-this-issue')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RpaPanel;
