import { useTranslation } from 'next-i18next';
import { Prisma } from '@/generated/browser';
import useTeamTasks from 'hooks/useTeamTasks';
import { capitalizeCountryName } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

const TeamAssessmentAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('common');
  const { tasks } = useTeamTasks(slug);

  const countriesSet = new Set<string>();
  let totalNumberOfAssessment = 0;
  let perAuthorization = 0;
  let notPermitAuthorization = 0;

  tasks?.forEach((task) => {
    const properties = task.properties as Prisma.JsonObject | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const procedures = properties?.tia_procedure as any[];

    if (Array.isArray(procedures)) {
      totalNumberOfAssessment += 1;

      procedures.forEach((proc) => {
        if (proc.CountryDataImporter?.value) {
          countriesSet.add(proc.CountryDataImporter.value.toLowerCase());
        }
      });

      const isAuthorized = procedures.some((proc) => proc.TransferMechanism === 'yes');
      if (isAuthorized) perAuthorization++;
      else notPermitAuthorization++;
    }
  });

  const countriesList = Array.from(countriesSet);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-slate-900">{t('tia')}</span>
        <span className="text-[11px] text-slate-400">
          {t('tia-assessments', { defaultValue: 'Assessments' })}
        </span>
      </div>

      <div className="divide-y divide-slate-50">
        <div className="flex items-center justify-between py-1.5 text-[12px]">
          <span className="text-slate-500">{t('number-of-assessments')}</span>
          <span className="font-medium text-slate-900">{totalNumberOfAssessment}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 text-[12px]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            {t('permit')}
          </span>
          <span className="font-medium text-green-600">{perAuthorization}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 text-[12px]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {t('not-permit')}
          </span>
          <span className="font-medium text-red-600">{notPermitAuthorization}</span>
        </div>
      </div>

      {countriesList.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-50">
          <div className="text-[11px] text-slate-400 mb-1.5">
            {t('assessment-per-country')}
          </div>
          <div className="flex flex-wrap gap-1">
            {countriesList.map((country, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-[4px]"
              >
                {capitalizeCountryName(country)}
              </span>
            ))}
          </div>
        </div>
      )}

      {notPermitAuthorization > 0 && (
        <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex gap-2 items-start text-[11px] text-red-700">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0 text-red-500" aria-hidden />
          {t('tia-non-adequate-warning', {
            defaultValue: `${notPermitAuthorization} transfer(s) to non-adequate countries require SCCs. Review pending.`,
            count: notPermitAuthorization,
          })}
        </div>
      )}
    </div>
  );
};

export default TeamAssessmentAnalysis;
