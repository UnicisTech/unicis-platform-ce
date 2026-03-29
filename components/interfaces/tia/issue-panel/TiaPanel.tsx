import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { steps, questions } from '@/lib/tia';
import { Field } from '@/components/shared/atlaskit';
import type { Task } from 'types';
import { TiaProcedureInterface } from 'types';
import RiskLevel from '../RiskLevel';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import {
  getTranslationKey,
  isTranferPermitted,
  getTiaRisks,
} from '@/lib/tia/helpers';

const TransferScenarioTab: React.FC<{ step: TiaProcedureInterface[0] }> = ({
  step,
}) => {
  const { t } = useTranslation('common');

  return (
    <div>
      <Field label={t(`tia:fields.DataExporter`)} value={step.DataExporter} />
      <Field
        label={t(`tia:fields.CountryDataExporter`)}
        value={step.CountryDataExporter}
      />
      <Field label={t(`tia:fields.DataImporter`)} value={step.DataImporter} />
      <Field
        label={t(`tia:fields.CountryDataImporter`)}
        value={step.CountryDataImporter}
      />
      <Field
        label={t(`tia:fields.TransferScenario`)}
        value={step.TransferScenario}
      />
      <Field label={t(`tia:fields.DataAtIssue`)} value={step.DataAtIssue} />
      <Field
        label={t(`tia:fields.HowDataTransfer`)}
        value={step.HowDataTransfer}
      />
      <Field
        label={t(`tia:fields.StartDateAssessment`)}
        value={<DaisyBadge color="tag">{step.StartDateAssessment}</DaisyBadge>}
      />
      <Field
        label={t(`tia:fields.AssessmentYears`)}
        value={step.AssessmentYears}
      />
      <Field
        label={t(`tia:fields.LawImporterCountry`)}
        value={step.LawImporterCountry}
      />
    </div>
  );
};

const ProblematicLawfulAccessTab: React.FC<{
  step: TiaProcedureInterface[1];
}> = ({ step }) => {
  const { t } = useTranslation('common');

  return (
    <div>
      {(
        [
          'EncryptionInTransit',
          'TransferMechanism',
          'LawfulAccess',
          'MassSurveillanceTelecommunications',
          'SelfReportingObligations',
        ] as const
      ).map((key) => (
        <Field
          key={key}
          label={t(`tia:fields.${key}`)}
          value={t(`${step[key]}`) || ''}
        />
      ))}
      {(
        [
          'ReasonEncryptionInTransit',
          'ReasonTransferMechanism',
          'ReasonLawfulAccess',
          'ReasonMassSurveillanceTelecommunications',
          'ReasonSelfReportingObligations',
        ] as const
      ).map((key) => (
        <Field
          key={key}
          label={t(`tia:fields.${key}`)}
          value={(step as any)[key] || ''}
        />
      ))}
    </div>
  );
};

const RiskTab: React.FC<{
  step: TiaProcedureInterface[2];
  targetedRisk: number;
  nonTargetedRisk: number;
  selfReportingRisk: number;
}> = ({ step, targetedRisk, nonTargetedRisk, selfReportingRisk }) => {
  const { t } = useTranslation('common');

  return (
    <div>
      {Object.entries(step).map(([key, val]) => {
        if (key.startsWith('Reason')) return null;
        const label = t(`tia:fields.${key}`);
        const display = t(`${getTranslationKey(val) || 'na'}`);
        return <Field key={key} label={label} value={display} />;
      })}

      <RiskLevel value={targetedRisk} />
      <RiskLevel value={nonTargetedRisk} />
      <RiskLevel value={selfReportingRisk} />
    </div>
  );
};

// Tab 3: Detailed questions
const ProbabilityTab: React.FC<{ step: TiaProcedureInterface[3] }> = ({
  step,
}) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div>
        <Field label={t(`tia:questions.${questions[0]}`)} />
        <Field
          label={t(`tia:fields.RelevantDataTransferImporter`)}
          value={(step as any)['RelevantDataTransferImporter'] || t('na')}
        />
        <Field
          label={t(`tia:fields.ProbabilityDataTransferImporter`)}
          value={(step as any)['ProbabilityDataTransferImporter'] || t('na')}
        />
        <Field
          label={t(`tia:fields.ReasonDataTransferImporter`)}
          value={(step as any)['ReasonDataTransferImporter'] || t('na')}
        />
      </div>
      <div>
        <Field label={t(`tia:questions.${questions[1]}`)} />
        <Field
          label={t(`tia:fields.RelevantTransferToImporter`)}
          value={(step as any)['RelevantTransferToImporter'] || t('na')}
        />
        <Field
          label={t(`tia:fields.ProbabilityTransferToImporter`)}
          value={(step as any)['ProbabilityTransferToImporter'] || t('na')}
        />
        <Field
          label={t(`tia:fields.ReasonTransferToImporter`)}
          value={(step as any)['ReasonTransferToImporter'] || t('na')}
        />
      </div>
      <div>
        <Field label={t(`tia:questions.${questions[2]}`)} />
        <Field
          label={t(`tia:fields.RelevantTransferToImporterForPerformance`)}
          value={
            (step as any)['RelevantTransferToImporterForPerformance'] || t('na')
          }
        />
        <Field
          label={t(`tia:fields.ProbabilityTransferToImporterPerformance`)}
          value={
            (step as any)['ProbabilityTransferToImporterPerformance'] || t('na')
          }
        />
        <Field
          label={t(`tia:fields.ReasonTransferToImporterPerformance`)}
          value={
            (step as any)['ReasonTransferToImporterPerformance'] || t('na')
          }
        />
      </div>
      <div>
        <Field label={t(`tia:questions.${questions[3]}`)} />
        <Field
          label={t(`tia:fields.RelevantLegalGround`)}
          value={(step as any)['RelevantLegalGround'] || t('na')}
        />
        <Field
          label={t(`tia:fields.ProbabilityLegalGround`)}
          value={(step as any)['ProbabilityLegalGround'] || t('na')}
        />
        <Field
          label={t(`tia:fields.ReasonLegalGround`)}
          value={(step as any)['ReasonLegalGround'] || t('na')}
        />
      </div>
    </>
  );
};

// Tab 4: Final decision
const ConclusionTab: React.FC<{ permitted: boolean }> = ({ permitted }) => {
  const { t } = useTranslation('common');

  return (
    <div>
      <Field
        label="Transfer decision"
        value={
          permitted ? (
            <DaisyBadge appearance="added">
              {t('tia-permitted-badge')}
            </DaisyBadge>
          ) : (
            <DaisyBadge appearance="removed">
              {t('tia-not-permitted-badge')}
            </DaisyBadge>
          )
        }
      />
    </div>
  );
};

const TiaPanel: React.FC<{ procedure: TiaProcedureInterface }> = ({
  procedure,
}) => {
  const { t } = useTranslation('common');
  const [selectedTab, setSelectedTab] = useState(0);

  const { targetedRisk, nonTargetedRisk, selfReportingRisk } = useMemo(() => {
    return getTiaRisks(procedure?.[2]);
  }, [procedure]);

  const isPermitted = useMemo(() => isTranferPermitted(procedure), [procedure]);

  const tabs = [
    <TransferScenarioTab key={0} step={procedure[0]} />,
    <ProblematicLawfulAccessTab key={1} step={procedure[1]} />,
    <RiskTab
      key={2}
      step={procedure[2]}
      targetedRisk={targetedRisk}
      nonTargetedRisk={nonTargetedRisk}
      selfReportingRisk={selfReportingRisk}
    />,
    <ProbabilityTab key={3} step={procedure[3]} />,
    <ConclusionTab key={4} permitted={isPermitted} />,
  ];

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold mb-4">{t('view-tia')}</h2>
      {procedure ? (
        <>
          <div role="tablist" className="tabs tabs-bordered">
            {steps.map((step, idx) => (
              <button
                key={idx}
                role="tab"
                className={`tab ${selectedTab === idx ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab(idx)}
              >
                {t(`tia:steps.${step}`)}
              </button>
            ))}
          </div>
          <div className="mt-4">{tabs[selectedTab]}</div>
        </>
      ) : (
        <div className="mt-2">
          <p>{t('procedure-has-not-been-created-for-this-issue')}</p>
        </div>
      )}
    </div>
  );
};

const TiaPanelContainer: React.FC<{ task: Task }> = ({ task }) => {
  const { t } = useTranslation('common');
  const properties = (task.properties as any) ?? {};
  const raw = properties.tia_procedure as unknown;

  if (!raw) {
    return (
      <div className="p-5">
        <h2 className="text-1xl font-bold mb-4">{t('view-tia')}</h2>
        <p className="mt-2 text-xs">
          {t('procedure-has-not-been-created-for-this-issue')}
        </p>
      </div>
    );
  }

  return <TiaPanel procedure={raw as TiaProcedureInterface} />;
};

export default TiaPanelContainer;
