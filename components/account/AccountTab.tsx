import {
  UserIcon,
} from '@heroicons/react/24/outline';
import type { User } from '@prisma/client';
import classNames from 'classnames';
import useCanAccess from 'hooks/useCanAccess';
import Link from 'next/link';

interface AccountTabProps {
  activeTab: string;
  heading?: string;
  user?: Partial<User>;
}

const AccountTab = ({ activeTab, heading, user }: AccountTabProps) => {
  const { canAccess } = useCanAccess();

  const navigations = [
    {
      name: 'Platform Account',
      href: `/settings/account`,
      active: activeTab === 'account',
      icon: UserIcon,
    },
    {
      name: 'Fleet Account',
      href: `/settings/fleet`,
      active: activeTab === 'fleet',
      icon: UserIcon,
    },
  ];

  return (
    <div className="flex flex-col pb-6">
      <h2 className="text-xl font-semibold mb-2">
        {heading ? heading : user?.name}
      </h2>
      <nav
        className=" flex space-x-5 border-b border-gray-300"
        aria-label="Tabs"
      >
        {navigations.map((menu) => {
          return (
            <Link
              href={menu.href}
              key={menu.href}
              className={classNames(
                'inline-flex items-center border-b-2 py-4 text-sm font-medium',
                menu.active
                  ? 'border-gray-900 text-gray-700 dark:text-gray-100'
                  : 'border-transparent text-gray-500 hover:border-gray-300  hover:text-gray-700 hover:dark:text-gray-100'
              )}
            >
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AccountTab;
