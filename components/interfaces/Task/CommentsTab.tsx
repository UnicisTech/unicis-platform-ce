import { useTranslation } from 'next-i18next';
import { taskCommentsNavigations } from '@/lib/tasks';
import { cn } from '@/components/shadcn/lib/utils';

const tabI18nKeys: Record<string, string> = {
  Comments: 'comments',
  Activity: 'activity',
};

const CommentsTab = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (name: string) => void;
}) => {
  const navigations = taskCommentsNavigations(activeTab);
  const { t } = useTranslation('common');

  return (
    <div
      className="inline-flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px]"
      role="tablist"
    >
      {navigations.map((menu) => (
        <button
          key={menu.name}
          id={`comments-tab-${menu.name.toLowerCase()}`}
          role="tab"
          aria-selected={menu.active}
          aria-controls={`comments-panel-${menu.name.toLowerCase()}`}
          onClick={() => setActiveTab(menu.name)}
          className={cn(
            'px-3 py-[6px] text-[12px] font-medium rounded-md transition-all whitespace-nowrap',
            menu.active
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-transparent border border-transparent'
          )}
        >
          {t(tabI18nKeys[menu.name] ?? menu.name)}
        </button>
      ))}
    </div>
  );
};

export default CommentsTab;
