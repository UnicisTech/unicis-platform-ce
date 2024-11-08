import {
  CodeBracketIcon,
  Cog6ToothIcon,
  TagIcon,
  CodeBracketSquareIcon,
} from '@heroicons/react/24/outline';
import type { Team } from '@prisma/client';
import classNames from 'classnames';
import Link from 'next/link';
import useCanAccess from 'hooks/useCanAccess';
import { TeamFeature } from 'types';


interface AssetTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
  teamFeatures: TeamFeature;
}

const AssetTab = ({ activeTab, team, heading, teamFeatures }: AssetTabProps) => {
  const { canAccess } = useCanAccess();

  const navigations = [
    {
      name: 'Fleet',
      href: `/teams/${team.slug}/asset-management`,
      active: activeTab === 'fleet',
      icon: Cog6ToothIcon,
    },
  ];

  if (
    teamFeatures.fleetTag &&
    canAccess('team_fleet_tag', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Tags',
      href: `/teams/${team.slug}/asset-management/tags`,
      active: activeTab === 'tags',
      icon: TagIcon,
    });
  }

  if (
    teamFeatures.fleetQuery &&
    canAccess('team_fleet_query', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Queries',
      href: `/teams/${team.slug}/asset-management/queries`,
      active: activeTab === 'queries',
      icon: CodeBracketIcon,
    });
  }

  if (
    teamFeatures.fleetPack &&
    canAccess('team_fleet_pack', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Packs',
      href: `/teams/${team.slug}/asset-management/packs`,
      active: activeTab === 'packs',
      icon: CodeBracketSquareIcon,
    });
  }

  if (
    teamFeatures.fleetQuery &&
    canAccess('team_fleet_query', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Distributors',
      href: `/teams/${team.slug}/asset-management/distributors`,
      active: activeTab === 'distributors',
      icon: CodeBracketSquareIcon,
    });
  }
  
  return (
    <div className="flex flex-col pb-6">
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

export default AssetTab;
