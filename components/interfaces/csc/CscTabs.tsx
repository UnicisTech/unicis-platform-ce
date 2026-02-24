import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { ISO } from 'types';
import { cscNavigations } from '@/lib/csc';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';

/** Sentinel value used to identify the Mapping Matrix tab */
export const MAPPING_MATRIX_TAB = '__mapping_matrix__' as const;
export type ActiveCscTab = ISO | typeof MAPPING_MATRIX_TAB;

const CscTabs = ({
  frameworks,
  activeTab,
  setActiveTab,
}: {
  frameworks: ISO[];
  activeTab: ActiveCscTab;
  setActiveTab: (name: ActiveCscTab) => void;
}) => {
  const { t } = useTranslation('common');

  // When the matrix tab is active, pass the first ISO so cscNavigations doesn't break
  const navigations = cscNavigations(
    activeTab === MAPPING_MATRIX_TAB ? frameworks[0] : activeTab,
    frameworks
  );

  return (
    <div className="mb-5">
      <nav
        className="-mb-px flex space-x-5 border-b border-gray-300 overflow-x-auto"
        aria-label="Tabs"
      >
        {/* Framework tabs */}
        {navigations.map((menu, index) => (
          <a
            key={index}
            className={classNames(
              'inline-flex items-center border-b-2 py-4 text-sm font-medium cursor-pointer whitespace-nowrap',
              menu.active && activeTab !== MAPPING_MATRIX_TAB
                ? 'border-gray-900 text-gray-700 dark:text-gray-200'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
            onClick={() => setActiveTab(menu.name as ISO)}
          >
            {isoValueToLabel(menu.name as ISO)}
          </a>
        ))}

        {/* Mapping Matrix tab — only shown when 2+ frameworks are enabled */}
        {frameworks.length >= 2 && (
          <a
            className={classNames(
              'inline-flex items-center gap-1.5 border-b-2 py-4 text-sm font-medium cursor-pointer whitespace-nowrap',
              activeTab === MAPPING_MATRIX_TAB
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
            onClick={() => setActiveTab(MAPPING_MATRIX_TAB)}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
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
          </a>
        )}
      </nav>
    </div>
  );
};

export default CscTabs;
