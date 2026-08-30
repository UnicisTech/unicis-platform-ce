import { useTranslation } from 'next-i18next';
import { type OsqueryPlatform } from '@/lib/fleet/tools';
import { cn } from '@/components/shadcn/lib/utils';

interface PlatformTabProps {
  activeTab: OsqueryPlatform;
  setTab: (tab: OsqueryPlatform) => void;
}

const PlatformTab = ({ activeTab, setTab }: PlatformTabProps) => {
  const { t } = useTranslation('common');

  const navigations: { name: string; tab: OsqueryPlatform }[] = [
    {
      name: t('windows'),
      tab: 'windows',
    },
    {
      name: t('linux-rpm'),
      tab: 'linux-rpm',
    },
    {
      name: t('linux-deb'),
      tab: 'linux-deb',
    },
    {
      name: t('macos'),
      tab: 'macos',
    },
    {
      name: t('advanced'),
      tab: 'advanced',
    },
  ];

  return (
    <div
      className="no-scrollbar flex space-x-5 overflow-x-auto border-b border-slate-200 dark:border-slate-700"
      role="tablist"
      aria-label={t('platform')}
    >
      {navigations.map((menu) => {
        const isActive = activeTab === menu.tab;

        return (
          <button
            type="button"
            key={menu.tab}
            id={`asset-platform-tab-${menu.tab}`}
            role="tab"
            aria-selected={isActive}
            aria-controls="asset-platform-panel"
            onClick={() => setTab(menu.tab)}
            className={cn(
              'inline-flex shrink-0 items-center whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors',
              isActive
                ? 'border-slate-900 text-slate-900 dark:border-slate-200 dark:text-slate-100'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
            )}
          >
            {menu.name}
          </button>
        );
      })}
    </div>
  );
};

export default PlatformTab;
