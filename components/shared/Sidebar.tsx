import {
  ChevronUpDownIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  FolderIcon,
  FolderPlusIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

import {
  QueueListIcon
} from "@heroicons/react/24/solid";
import useTeams from 'hooks/useTeams';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Icon from './Icon';

import NavItem from './NavItem';

export default function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const { slug } = router.query;

  useEffect(() => {
    if (typeof slug === 'string') {
      document.title = `Unicis Platform - ${slug}`
    } else {
      document.title = 'Unicis Platform';
    }
    
    return () => {
      document.title = 'Unicis Platform';
    };
  }, [slug])

  const sidebarMenus = {
    personal: [
      {
        name: t('all-teams'),
        href: '/teams',
        icon: RectangleStackIcon,
      },
      {
        name: t('account'),
        href: '/settings/account',
        icon: UserCircleIcon,
      },
      {
        name: t('password'),
        href: '/settings/password',
        icon: LockClosedIcon,
      },
    ],
    team: [
      {
        name: t('all-tasks'),
        href: `/teams/${slug}/tasks`,
        icon: QueueListIcon,
        className: "fill-blue-600"
      },
      {
        name: t('rpa-activities'),
        href: `/teams/${slug}/rpa`,
        icon: () => <Icon src="/unicis-rpa-logo.png" />,
      },
      {
        name: t('tia'),
        href: `/teams/${slug}/tia`,
        icon: () => <Icon src="/unicis-tia-logo.png" />,
      },
      {
        name: t('csc'),
        href: `/teams/${slug}/csc`,
        icon: () => <Icon src="/unicis-csc-logo.png" />,
      },
      {
        name: t('iap'),
        href: `/teams/${slug}/iap`,
        icon: () => <Icon src="/unicis-iap-logo.png" />
      },
      {
        name: t('all-products'),
        href: 'https://www.unicis.tech/docs',
        icon: CodeBracketIcon,
      },
      {
        name: t('settings'),
        href: `/teams/${slug}/settings`,
        icon: Cog6ToothIcon,
      },
      {
        name: t('members'),
        href: `/teams/${slug}/members`,
        icon: UsersIcon,
      },
    ],
  };

  const menus = sidebarMenus[slug ? 'team' : 'personal'];

  return (
    <>
      <aside
        className="transition-width fixed top-0 left-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-12 duration-75 lg:flex"
        aria-label="Sidebar"
      >
        <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex-1 space-y-1 divide-y bg-white">
              <TeamDropdown />
              <div className="p-4">
                <ul className="space-y-1">
                  {menus.map((item) => (
                    <li key={item.name}>
                      <NavItem
                        href={item.href}
                        text={t(item.name)}
                        icon={item.icon}
                        active={router.asPath === item.href}
                        className={item.className}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div
        className="fixed inset-0 z-10 hidden bg-gray-900 opacity-50"
        id="sidebarBackdrop"
      />
    </>
  );
}

const TeamDropdown = () => {
  const router = useRouter();

  const { teams } = useTeams();
  const { data } = useSession();
  const { t } = useTranslation('common');

  const currentTeam = (teams || []).find(
    (team) => team.slug === router.query.slug
  );

  const menus = [
    {
      id: 1,
      name: t('profile'),
      items: [
        {
          id: data?.user.id,
          name: data?.user?.name,
          href: '/settings/account',
          icon: UserCircleIcon,
        },
      ],
    },
    {
      id: 2,
      name: t('teams'),
      items: (teams || []).map((team) => ({
        id: team.id,
        name: team.name,
        href: `/teams/${team.slug}/settings`,
        icon: FolderIcon,
      })),
    },
    {
      id: 3,
      name: '',
      items: [
        {
          id: 'all-teams',
          name: t('all-teams'),
          href: '/teams',
          icon: RectangleStackIcon,
        },
        {
          id: 'new-team',
          name: t('new-team'),
          href: '/teams?newTeam=true',
          icon: FolderPlusIcon,
        },
      ],
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex">
        <div className="dropdown w-full">
          <div
            tabIndex={0}
            className="border border-gray-300 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
          >
            {currentTeam?.name || data?.user?.name}{' '}
            <ChevronUpDownIcon className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content p-2 shadow-md bg-base-100 w-full rounded border px-2"
          >
            {menus.map(({ id, name, items }) => {
              return (
                <React.Fragment key={id}>
                  {name && (
                    <li
                      className="text-xs text-gray-500 py-1 px-2"
                      key={`${id}-name`}
                    >
                      {name}
                    </li>
                  )}
                  {items.map((item) => (
                    <li
                      key={`${id}-${item.id}`}
                      onClick={() => {
                        if (document.activeElement) {
                          (document.activeElement as HTMLElement).blur();
                        }
                      }}
                    >
                      <Link href={item.href}>
                        <div className="flex hover:bg-gray-100 focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center">
                          <item.icon className="w-5 h-5" /> {item.name}
                        </div>
                      </Link>
                    </li>
                  ))}
                  {name && <li className="divider m-0" key={`${id}-divider`} />}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
