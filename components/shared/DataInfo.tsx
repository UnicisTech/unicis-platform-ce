import React from 'react';
import { useTranslation } from 'next-i18next';

const DataInfo = ({
  header,
  data,
}: {
  header: string;
  data: string | number | undefined | null;
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 truncate">
        {header}
      </div>
      <div className="px-2.5 py-1.5 text-[12px] text-slate-900 dark:text-slate-100 break-words">
        {data !== undefined && data !== null && data !== ''
          ? data
          : t('not-available', { defaultValue: 'N/A' })}
      </div>
    </div>
  );
};

export default DataInfo;
