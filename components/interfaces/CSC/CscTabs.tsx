import classNames from 'classnames';
import { ISO } from 'types';
import { cscNavigations } from '@/lib/csc';
import { isoValueToLabel } from '@/components/defaultLanding/data/configs/csc';

const CscTabs = ({
  iso,
  activeTab,
  setActiveTab,
}: {
  iso: ISO[];
  activeTab: ISO;
  setActiveTab: (name: ISO) => void;
}) => {
  const navigations = cscNavigations(activeTab, iso)

  return (
    <div className="mb-5">
      <nav
        className="-mb-px flex space-x-5 border-b border-gray-300 overflow-x-auto"
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
                setActiveTab(menu.name as ISO);
              }}
            >
              {isoValueToLabel(menu.name)}
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default CscTabs;
