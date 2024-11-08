import {
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { MenuItem, NavigationProps } from './NavigationItems';

const UserNavigation = ({ activePathname }: NavigationProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('all-teams'),
      href: '/teams',
      icon: RectangleStackIcon,
      active: activePathname === '/teams',
      className: 'stroke-blue-600',
    },
    {
      name: t('account'),
      href: '/settings/account',
      icon: UserCircleIcon,
      active: activePathname === '/settings/account',
      className: 'stroke-blue-600',
    },
    {
      name: t('password'),
      href: '/settings/password',
      icon: LockClosedIcon,
      active: activePathname === '/settings/password',
      className: 'stroke-blue-600',
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default UserNavigation;
