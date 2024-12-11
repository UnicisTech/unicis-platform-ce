import {
  Cog6ToothIcon,
  CodeBracketIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { QueueListIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';
import Icon from '../Icon';
import useCanAccess from '@/hooks/useCanAccess';
import { GetServerSidePropsContext } from 'next';
import { prisma } from '@/lib/prisma';
import useTeam from '@/hooks/useTeam';
import { getCurrentPlan } from '@/lib/subscriptions';
import Loading from '../Loading';
import useHasPlan from '@/hooks/useHasPlan';
import { useEffect } from 'react';
import { $Enums } from '@prisma/client';
import env from '@/lib/env';


interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { hasPlan, checkedHasPlan } = useHasPlan();

  useEffect(() => {
    const checkPlan = async () => {
      const result = await hasPlan(slug);
      console.log("Does the team have the plan?", result);
    };

    checkPlan();
  }, [hasPlan]);

  const menus: MenuItem[] = [
    {
      name: t('Dashboard'),
      href: `/teams/${slug}/dashboard`,
      icon: ChartBarIcon,
      className: 'fill-blue-600 stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('dashboard'),
    },
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
    canAccess('asset_dashboard', ['create', 'update', 'read', 'delete']) && checkedHasPlan && {
      name: t('Asset Management'),
      href: `/teams/${slug}/asset`,
      icon: () => <Icon src="/asset-dashboard.png" />,
      className: 'fill-blue-600 stroke-blue-600',
      active: activePathname === `/teams/${slug}/asset`,
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
        activePathname.includes('documentation'),
    },
    {
      name: t('feedback'),
      href: 'https://feedback.unicis.tech',
      icon: ChatBubbleBottomCenterTextIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('feedback'),
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        /(settings|billing|members|saml|directory-sync|audit-logs|webhooks|api-keys|fleet|querys|tags|packs|distributors|asset-management)/.test(
          activePathname
        ),
    },
  ].filter((menu): menu is MenuItem => Boolean(menu)); // Don't remove this filter : Menu type excape

  return <NavigationItems menus={menus} />;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { query }: GetServerSidePropsContext = context;

  const slug = query.slug as string;
  const { isLoading, team } = useTeam(slug as string);

  if (isLoading || !team) {
    return <Loading />;
  }

  const subscription = async (teamId: string) => {
    const subscription = await prisma.subscription.findUnique({
      where: { teamId },
    });
    return subscription;
  };
  const currentPlan = await getCurrentPlan(await subscription(team.id!));
  console.log('PLAN: ', currentPlan);

  return {
    props: {
      currentPlan: currentPlan,
    },
  };
};

export default TeamNavigation;

