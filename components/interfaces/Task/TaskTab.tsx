import { useTranslation } from 'next-i18next';
import { taskNavigations } from '@/lib/tasks';
import { cn } from '@/components/shadcn/lib/utils';

/** Derive a stable HTML-safe ID from a tab name, e.g. "Processing Activities" → "task-tab-processing-activities" */
export const toTaskTabId = (name: string) =>
  `task-tab-${name.toLowerCase().replace(/\s+/g, '-')}`;
/** Panel ID matching a tab name — used by parent to wire up role="tabpanel" */
export const toTaskPanelId = (name: string) =>
  `task-panel-${name.toLowerCase().replace(/\s+/g, '-')}`;

const TaskTab = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (name: string) => void;
}) => {
  const { t } = useTranslation('common');
  const navigations = taskNavigations(activeTab);

  // Map navigation name → i18n key (falls back to raw name if no key exists)
  const labelKey: Record<string, string> = {
    Overview: 'overview',
    'Processing Activities': 'rpa-activities',
    'Transfer Impact Assessment': 'tia',
    'Privacy Impact Assessment': 'pia',
    'Cybersecurity Controls': 'csc',
    'Risk Management': 'rm',
  };

  return (
    <div
      className="inline-flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px] mb-4 flex-wrap"
      role="tablist"
    >
      {navigations.map((menu) => (
        <button
          key={menu.name}
          id={toTaskTabId(menu.name)}
          role="tab"
          aria-selected={menu.active}
          aria-controls={toTaskPanelId(menu.name)}
          onClick={() => setActiveTab(menu.name)}
          className={cn(
            'px-3 py-[6px] text-[12px] font-medium rounded-md transition-all whitespace-nowrap',
            menu.active
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-transparent border border-transparent'
          )}
        >
          {t(labelKey[menu.name] ?? menu.name, menu.name)}
        </button>
      ))}
    </div>
  );
};

export default TaskTab;
