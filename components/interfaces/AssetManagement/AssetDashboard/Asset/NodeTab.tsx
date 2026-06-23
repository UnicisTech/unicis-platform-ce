import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { assetNavigations } from '@/lib/fleet/assets';

const TAB_LABEL_KEYS: Record<string, string> = {
  Overview: 'fleet:tab-overview',
  'Status Logs': 'fleet:tab-status-logs',
  'Result Logs': 'fleet:tab-result-logs',
  'Asset Configurations': 'fleet:tab-asset-configurations',
};

const NodeTab = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (name: string) => void;
}) => {
  const { t } = useTranslation('fleet');
  const navigations = assetNavigations(activeTab);

  return (
    <div className="mb-4">
      <nav
        className="flex gap-5 border-b border-slate-200 dark:border-slate-700"
        aria-label="Tabs"
      >
        {navigations.map((menu) => {
          return (
            <button
              key={menu.name}
              type="button"
              aria-current={menu.active ? 'page' : undefined}
              className={classNames(
                'inline-flex items-center border-b-2 py-2.5 text-[13px] font-medium cursor-pointer transition-colors',
                menu.active
                  ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
              )}
              onClick={() => {
                setActiveTab(menu.name);
              }}
            >
              {t(TAB_LABEL_KEYS[menu.name] ?? menu.name)}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default NodeTab;
