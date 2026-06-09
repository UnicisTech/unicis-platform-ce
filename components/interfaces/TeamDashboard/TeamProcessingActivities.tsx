import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import useTeamTasks from 'hooks/useTeamTasks';
import type { TaskProperties } from 'types';
import { capitalizeCountryName } from '@/lib/utils';
import { Database, ArrowRightLeft, Globe } from 'lucide-react';

const ProcessingActivitiesAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('common');
  const { tasks } = useTeamTasks(slug);

  const { totalTasksWithRpaProcedure, totalEnabledDataTransfers, countriesList } =
    useMemo(() => {
      let withProcedure = 0;
      let enabledTransfers = 0;
      const countries = new Set<string>();

      for (const task of tasks ?? []) {
        const props = task.properties as unknown as TaskProperties | null | undefined;
        const proc = props?.rpa_procedure;
        if (!Array.isArray(proc)) continue;
        withProcedure += 1;
        const transferSection = proc[3];
        if (transferSection && typeof transferSection === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((transferSection as any).datatransfer === true) enabledTransfers += 1;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const countryValue = (transferSection as any).country?.value;
          if (typeof countryValue === 'string' && countryValue.trim()) {
            countries.add(countryValue.trim().toLowerCase());
          }
        }
      }

      return {
        totalTasksWithRpaProcedure: withProcedure,
        totalEnabledDataTransfers: enabledTransfers,
        countriesList: Array.from(countries).sort((a, b) => a.localeCompare(b)),
      };
    }, [tasks]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-slate-900">
          {t('rpa-records-activities')}
        </span>
      </div>

      <div className="divide-y divide-slate-50">
        <div className="flex items-center justify-between py-1.5 text-[12px]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Database size={12} aria-hidden />
            {t('number-of-records')}
          </span>
          <span className="font-medium text-slate-900">{totalTasksWithRpaProcedure}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 text-[12px]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <ArrowRightLeft size={12} aria-hidden />
            {t('enabled-data-transfer')}
          </span>
          <span className="font-medium text-slate-900">{totalEnabledDataTransfers}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 text-[12px]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Globe size={12} aria-hidden />
            {t('processes-per-country')}
          </span>
          <span className="font-medium text-slate-900">{countriesList.length}</span>
        </div>
      </div>

      {countriesList.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-50">
          <div className="text-[11px] text-slate-400 mb-1.5">
            {t('countries', { defaultValue: 'Countries' })}
          </div>
          <div className="flex flex-wrap gap-1">
            {countriesList.map((country) => (
              <span
                key={country}
                className="inline-flex items-center text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-[4px]"
              >
                {capitalizeCountryName(country)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingActivitiesAnalysis;
