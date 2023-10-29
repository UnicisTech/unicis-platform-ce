import { Cog6ToothIcon, CodeBracketIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import {
  QueueListIcon
} from "@heroicons/react/24/solid";

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
    // {
    //   name: t('iap'),
    //   href: `/teams/${slug}/iap`,
    //   icon: () => <Icon src="/unicis-iap-logo.png" />
    // },
    {
      name: t('all-products'),
      href: 'https://www.unicis.tech/docs',
      icon: CodeBracketIcon,
    },
    {
      name: t('support'),
      href: 'https://discord.com/invite/8TwyeD97HD',
      icon: QuestionMarkCircleIcon,
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        !activePathname.includes('products'),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
