import {
  Cog6ToothIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import type { Team } from '@prisma/client';
import classNames from 'classnames';
import useCanAccess from 'hooks/useCanAccess';
import Link from 'next/link';
import { TeamFeature } from 'types';

interface TeamTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
  teamFeatures: TeamFeature;
}

const TeamTab = ({ activeTab, team, heading, teamFeatures }: TeamTabProps) => {
  const { canAccess } = useCanAccess();

  const navigations = [
    {
      name: 'Fleet',
      href: `/teams/${team.slug}/fleet`,
      active: activeTab === 'fleet',
      icon: Cog6ToothIcon,
    },
    {
      name: 'Packs',
      href: `/teams/${team.slug}/packs`,
      active: activeTab === 'packs',
      icon: CodeBracketIcon,
    },
    {
      name: 'Querys',
      href: `/teams/${team.slug}/querys`,
      active: activeTab === 'querys',
      icon: CodeBracketIcon,
    },
    {
      name: 'Tags',
      href: `/teams/${team.slug}/tags`,
      active: activeTab === 'tags',
      icon: CodeBracketIcon,
    },
  ];

  return (
    <div className="flex flex-col pb-6">
      <h2 className="text-xl font-semibold mb-2">
        {heading ? heading : team.name}
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

export default TeamTab;
