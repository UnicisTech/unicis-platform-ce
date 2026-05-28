import classNames from 'classnames';
import { useTranslation } from 'next-i18next';

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
    <div className="mb-5">
      <nav
        className="-mb-px flex space-x-5 border-b border-gray-300 overflow-x-auto"
        aria-label="Tabs"
      >
        {taskViews.map((view) => (
          <a
            key={view}
            className={classNames(
              'inline-flex items-center border-b-2 py-4 text-sm font-medium cursor-pointer whitespace-nowrap',
              activeView === view
                ? 'border-gray-900 text-gray-700 dark:text-gray-200'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
            onClick={() => setActiveView(view)}
          >
            {t(`task-view-tabs.${view}`, view === 'list' ? 'List' : 'Kanban')}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default TaskViewTabs;
