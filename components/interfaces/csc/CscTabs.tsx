import { useTranslation } from 'next-i18next';
import { ISO } from 'types';
import { cscNavigations } from '@/lib/csc';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import { cn } from '@/components/shadcn/lib/utils';
import { Dispatch, SetStateAction } from 'react';

/** Sentinel value used to identify the Mapping Matrix tab */
export const MAPPING_MATRIX_TAB = '__mapping_matrix__' as const;
export type ActiveCscTab = ISO | typeof MAPPING_MATRIX_TAB;

const CscTabs = ({
  frameworks,
  activeTab,
  setActiveTab,
  showMatrixMapping = true,
}: {
  frameworks: ISO[];
  activeTab: ActiveCscTab;
  setActiveTab: Dispatch<SetStateAction<any>>;
  showMatrixMapping?: boolean;
}) => {
  const { t } = useTranslation('common');

  // When the matrix tab is active, pass the first ISO so cscNavigations doesn't break
  const navigations = cscNavigations(
    activeTab === MAPPING_MATRIX_TAB ? frameworks[0] : activeTab,
    frameworks
  );

  return (
    <div
      className="flex gap-0.5 bg-slate-100 rounded-lg p-[3px] mb-4 flex-wrap"
      role="tablist"
    >
      {/* Framework tabs */}
      {navigations.map((menu, index) => {
        const isActive = menu.active && activeTab !== MAPPING_MATRIX_TAB;
        return (
          <button
            key={index}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(menu.name as ISO)}
            className={cn(
              'px-3 py-[6px] text-[12px] font-medium rounded-md transition-all whitespace-nowrap',
              isActive
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 bg-transparent border border-transparent'
            )}
          >
            {isoValueToLabel(menu.name as ISO)}
          </button>
        );
      })}

      {/* Mapping Matrix tab — only shown when 2+ frameworks are enabled */}
      {showMatrixMapping && frameworks.length >= 2 && (
        <button
          role="tab"
          aria-selected={activeTab === MAPPING_MATRIX_TAB}
          onClick={() => setActiveTab(MAPPING_MATRIX_TAB)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-[6px] text-[12px] font-medium rounded-md transition-all whitespace-nowrap',
            activeTab === MAPPING_MATRIX_TAB
              ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 bg-transparent border border-transparent'
          )}
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18M10 3v18M14 3v18"
            />
          </svg>
          {t('csc-mapping.tabs.matrix', 'Mapping Matrix')}
        </button>
      )}
    </div>
  );
};

export default CscTabs;
