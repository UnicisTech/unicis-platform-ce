import { useTranslation } from 'next-i18next';
import { cn } from '@/components/shadcn/lib/utils';

export type ActiveTaskView = 'list' | 'kanban';

const taskViews: ActiveTaskView[] = ['list', 'kanban'];

const TaskViewTabs = ({
  activeView,
  setActiveView,
}: {
  activeView: ActiveTaskView;
  setActiveView: (view: ActiveTaskView) => void;
}) => {
  const { t } = useTranslation('common');

  return (
    <div
      className="inline-flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px] mb-3"
      role="tablist"
    >
      {taskViews.map((view) => (
        <button
          key={view}
          id={`task-view-tab-${view}`}
          role="tab"
          aria-selected={activeView === view}
          aria-controls="task-view-panel"
          onClick={() => setActiveView(view)}
          className={cn(
            'px-4 py-[6px] text-[12px] font-medium rounded-md transition-all',
            activeView === view
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-transparent border border-transparent'
          )}
        >
          {t(`task-view-tabs.${view}`, view === 'list' ? 'List' : 'Kanban')}
        </button>
      ))}
    </div>
  );
};

export default TaskViewTabs;
