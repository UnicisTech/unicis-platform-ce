import classNames from 'classnames';
import { taskNavigations } from '@/lib/tasks';

const TaskTab = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (name: string) => void;
}) => {
  const navigations = taskNavigations(activeTab);

  return (
    <div className="mb-5">
      <nav
        className="-mb-px flex space-x-5 border-b border-gray-300"
        aria-label="Tabs"
      >
        {navigations.map((menu, index) => {
          return (
            <a
              key={index}
              className={classNames(
                'inline-flex items-center border-b-2 py-4 text-sm font-medium cursor-pointer',
                menu.active
                  ? 'border-gray-900 text-gray-700 dark:text-gray-200'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
              onClick={() => {
                setActiveTab(menu.name);
              }}
            >
              {menu.name}
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default TaskTab;
