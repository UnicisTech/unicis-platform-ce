import { useTranslation } from 'next-i18next';
import { ISO } from 'types';
import { cscNavigations } from '@/lib/csc';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import { cn } from '@/components/shadcn/lib/utils';
import { Dispatch, SetStateAction } from 'react';
import { Lock } from 'lucide-react';

/** Sentinel value used to identify the Mapping Matrix tab */
export const MAPPING_MATRIX_TAB = '__mapping_matrix__' as const;
export type ActiveCscTab = ISO | typeof MAPPING_MATRIX_TAB;

// ── Grid icon (inline SVG, keeps no extra dependency) ─────────────────────────
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('flex-shrink-0', className)}
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
  );
}

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

  const matrixUnlocked = frameworks.length >= 2;

  return (
    <div
      className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px] mb-4 flex-wrap"
      role="tablist"
    >
      {/* ── Mapping Matrix tab — always visible (first position) ── */}
      {showMatrixMapping && (
        <button
          role="tab"
          aria-selected={activeTab === MAPPING_MATRIX_TAB && matrixUnlocked}
          disabled={!matrixUnlocked}
          onClick={() => matrixUnlocked && setActiveTab(MAPPING_MATRIX_TAB)}
          title={
            matrixUnlocked
              ? undefined
              : t('csc-mapping.tabs.matrix-locked', 'Enable 2+ frameworks to unlock the Mapping Matrix')
          }
          className={cn(
            'flex items-center gap-1.5 px-3 py-[6px] text-[12px] font-medium rounded-md transition-all whitespace-nowrap',
            activeTab === MAPPING_MATRIX_TAB && matrixUnlocked
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs'
              : matrixUnlocked
                ? 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-transparent border border-transparent'
                : 'text-slate-400 cursor-not-allowed bg-transparent border border-transparent'
          )}
        >
          {matrixUnlocked ? (
            <GridIcon className="w-3.5 h-3.5" />
          ) : (
            <Lock size={12} aria-hidden />
          )}
          {t('csc-mapping.tabs.matrix', 'Mapping Matrix')}
        </button>
      )}

      {/* ── Framework tabs ── */}
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
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-transparent border border-transparent'
            )}
          >
            {isoValueToLabel(menu.name as ISO)}
          </button>
        );
      })}
    </div>
  );
};

export default CscTabs;
