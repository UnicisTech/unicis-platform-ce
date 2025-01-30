import {
  Cog6ToothIcon,
  CodeBracketIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';
import { QueueListIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'next-i18next';
import useCanAccess from 'hooks/useCanAccess';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';
import Icon from '../Icon';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const relativePath = activePathname?.slice(`/teams/${slug}`.length) || ''
  const menus: (MenuItem | null)[] = [
    {
      name: t('Dashboard'),
      href: `/teams/${slug}/dashboard`,
      icon: ChartBarIcon,
      className: 'fill-blue-600 stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('dashboard'),
    },
    {
      name: t('all-tasks'),
      href: `/teams/${slug}/tasks`,
      icon: QueueListIcon,
      className: 'fill-blue-600 stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('tasks'),
    },
    {
      name: t('rpa-activities'),
      href: `/teams/${slug}/rpa`,
      icon: () => <Icon src="/unicis-rpa-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('rpa'),
    },
    {
      name: t('tia'),
      href: `/teams/${slug}/tia`,
      icon: () => <Icon src="/unicis-tia-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('tia'),
    },
    {
      name: t('pia'),
      href: `/teams/${slug}/pia`,
      icon: () => <Icon src="/unicis-csc-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('pia'),
    },
    {
      name: t('csc'),
      href: `/teams/${slug}/csc`,
      icon: () => <Icon src="/unicis-csc-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('csc'),
    },
    canAccess('iap_course', ['update']) ? {
      name: t('iap'),
      href: `/teams/${slug}/iap`,
      icon: () => <Icon src="/unicis-iap-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('iap') && !relativePath.includes('iap/admin'),
    } : null,
    {
      name: t('rm'),
      href: `/teams/${slug}/risk-management`,
      icon: () => <Icon src="/unicis-csc-logo.png" />,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('risk-management'),
    },
    {
      name: 'line-break',
      href: '',
    },
    {
      name: t('documentation'),
      href: 'https://www.unicis.tech/docs',
      icon: CodeBracketIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('documentation'),
    },
    {
      name: t('knowledge-base'),
      href: 'https://www.unicis.tech/kb',
      icon: LifebuoyIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('documentation'),
    },
    {
      name: t('feedback'),
      href: 'https://feedback.unicis.tech',
      icon: ChatBubbleBottomCenterTextIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        relativePath.includes('feedback'),
    },
    {
      name: t('support'),
      href: 'https://discord.com/invite/8TwyeD97HD',
      icon: QuestionMarkCircleIcon,
      className: 'stroke-blue-600',
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        /(settings|billing|members|saml|directory-sync|audit-logs|webhooks|api-keys|iap\/admin)/.test(
          relativePath
        ),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
