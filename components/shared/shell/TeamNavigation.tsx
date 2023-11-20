import { Cog6ToothIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { QueueListIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';
import Icon from '../Icon';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('all-tasks'),
      href: `/teams/${slug}/tasks`,
      icon: QueueListIcon,
      className: 'fill-blue-600 stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('tasks'),
    },
    {
      name: t('rpa-activities'),
      href: `/teams/${slug}/rpa`,
      icon: () => <Icon src="/unicis-rpa-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('rpa'),
    },
    {
      name: t('tia'),
      href: `/teams/${slug}/tia`,
      icon: () => <Icon src="/unicis-tia-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('tia'),
    },
    {
      name: t('csc'),
      href: `/teams/${slug}/csc`,
      icon: () => <Icon src="/unicis-csc-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('csc'),
    },
    // {
    //   name: t('iap'),
    //   href: `/teams/${slug}/iap`,
    //   icon: () => <Icon src="/unicis-iap-logo.png" />
    // },
    {
      name: t('documentation'),
      href: 'https://www.unicis.tech/docs',
      icon: CodeBracketIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('documentation'),
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('settings'),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
