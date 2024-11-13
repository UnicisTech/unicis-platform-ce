import {
    CodeBracketIcon,
    Cog6ToothIcon,
    TagIcon,
    CodeBracketSquareIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';
import useCanAccess from 'hooks/useCanAccess';
import { Button } from 'react-daisyui';


interface PlatformTabProps {
    activeTab: string;
    setTab: (tab: string) => void;
}

const PlatformTab = ({ activeTab, setTab } : PlatformTabProps) => {
    const { canAccess } = useCanAccess();

    const navigations = [
        {
            name: 'Windows',
            tab: `windows`,
            active: activeTab === 'windows',
            icon: Cog6ToothIcon,
        },
        {
            name: 'Asset',
            tab: `windows`,
            active: activeTab === 'windows',
            icon: Cog6ToothIcon,
        },
        {
            name: 'Asset',
            tab: `windows`,
            active: activeTab === 'windows',
            icon: Cog6ToothIcon,
        },
        {
            name: 'Asset',
            tab: `windows`,
            active: activeTab === 'windows',
            icon: Cog6ToothIcon,
        },
    ];

    return (
        <div className="flex flex-col pb-6">
            <nav
                className=" flex space-x-5 border-b border-gray-300"
                aria-label="Tabs"
            >
                {navigations.map((menu) => {
                    return (
                        <Button
                            onClick={() => {setTab(menu.tab)}}
                            key={menu.tab}
                            className={classNames(
                                'inline-flex items-center border-b-2 py-4 text-sm font-medium',
                                menu.active
                                    ? 'border-gray-900 text-gray-700 dark:text-gray-100'
                                    : 'border-transparent text-gray-500 hover:border-gray-300  hover:text-gray-700 hover:dark:text-gray-100'
                            )}
                        >
                            {menu.name}
                        </Button>
                    );
                })}
            </nav>
        </div>
    );
};

export default PlatformTab;
