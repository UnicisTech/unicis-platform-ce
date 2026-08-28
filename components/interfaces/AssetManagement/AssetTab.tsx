import {
  CodeBracketIcon,
  Cog6ToothIcon,
  TagIcon,
  CodeBracketSquareIcon,
} from '@heroicons/react/24/outline';
import type { Team } from '@/generated/client';
import classNames from 'classnames';
import Link from 'next/link';
import useCanAccess from 'hooks/useCanAccess';
import { useTranslation } from 'next-i18next';
import { TeamFeature } from 'types';

interface AssetTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
  teamFeatures: TeamFeature;
}

const AssetTab = ({
  activeTab,
  team,
  heading: _heading,
  teamFeatures: _teamFeatures,
}: AssetTabProps) => {
  const { canAccess } = useCanAccess(team.slug);
  const { t } = useTranslation('fleet');

  const navigations = [
    {
      name: t('asset-tab-asset'),
      href: `/teams/${team.slug}/asset-management`,
      active: activeTab === 'fleet',
      icon: Cog6ToothIcon,
    },
  ];

  if (canAccess('team_fleet_tag', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: t('asset-tab-tags'),
      href: `/teams/${team.slug}/asset-management/tags`,
      active: activeTab === 'tags',
      icon: TagIcon,
    });
  }

  if (canAccess('team_fleet_query', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: t('asset-tab-queries'),
      href: `/teams/${team.slug}/asset-management/queries`,
      active: activeTab === 'queries',
      icon: CodeBracketIcon,
    });
  }

  if (canAccess('team_fleet_pack', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: t('asset-tab-packs'),
      href: `/teams/${team.slug}/asset-management/packs`,
      active: activeTab === 'packs',
      icon: CodeBracketSquareIcon,
    });
  }

  if (canAccess('team_fleet_query', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: t('asset-tab-distributors'),
      href: `/teams/${team.slug}/asset-management/distributors`,
      active: activeTab === 'distributors',
      icon: CodeBracketSquareIcon,
    });
  }

  return (
    <div className="flex flex-col pb-6">
      <nav
        className="no-scrollbar flex space-x-5 overflow-x-auto border-b border-slate-200 dark:border-slate-700"
        aria-label="Tabs"
      >
        {navigations.map((menu) => {
          return (
            <Link
              href={menu.href}
              key={menu.href}
              className={classNames(
                'inline-flex items-center whitespace-nowrap border-b-2 py-4 text-sm font-medium',
                menu.active
                  ? 'border-slate-900 text-slate-900 dark:border-slate-200 dark:text-slate-100'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
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
