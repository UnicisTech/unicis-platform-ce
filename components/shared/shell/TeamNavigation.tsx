import {
  CodeBracketIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';
import { QueueListIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import useCanAccess from 'hooks/useCanAccess';
import useTeamTasks from 'hooks/useTeamTasks';
import useIap from 'hooks/useIAP';
import NavigationItems from './NavigationItems';
import type { NavigationProps, MenuItem } from './NavigationItems';
import Icon from '../Icon';
import { useAssetModuleAccess } from '@/hooks/fleets/useAssetModuleAccess';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(slug);
  const { isReady: hasAssetModuleAccess } = useAssetModuleAccess(slug);
  const { tasks } = useTeamTasks(slug);
  const { teamCourses } = useIap(false, slug);
  const relativePath = activePathname?.slice(`/teams/${slug}`.length) || '';

  // ── Badge counts ────────────────────────────────────────────────────────────
  // overdue/open* are "needs attention" counts (red/amber). rpa/tia/pia/iap
  // are plain "total items in this module" counts (neutral grey), matching
  // the record-count badge shown on each module's own page heading.
  const {
    overdueCount,
    openCscCount,
    openRmCount,
    rpaCount,
    tiaCount,
    piaCount,
  } = useMemo(() => {
    if (!tasks)
      return {
        overdueCount: 0,
        openCscCount: 0,
        openRmCount: 0,
        rpaCount: 0,
        tiaCount: 0,
        piaCount: 0,
      };
    const now = new Date();
    let overdue = 0;
    let csc = 0;
    let rm = 0;
    let rpa = 0;
    let tia = 0;
    let pia = 0;
    for (const task of tasks) {
      const props = task.properties as Record<string, unknown> | null;
      const isDone = task.status === 'done';
      if (!isDone && task.duedate && new Date(task.duedate as string) < now)
        overdue++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (
        !isDone &&
        Array.isArray((props as any)?.csc_controls) &&
        (props as any).csc_controls.length > 0
      )
        csc++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!isDone && (props as any)?.rm_risk) rm++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((props as any)?.rpa_procedure) rpa++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((props as any)?.tia_procedure) tia++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((props as any)?.pia_risk) pia++;
    }
    return {
      overdueCount: overdue,
      openCscCount: csc,
      openRmCount: rm,
      rpaCount: rpa,
      tiaCount: tia,
      piaCount: pia,
    };
  }, [tasks]);

  const iapCount = teamCourses?.length ?? 0;

  const menus: (MenuItem | null)[] = [
    {
      name: t('Dashboard'),
      href: `/teams/${slug}/dashboard`,
      icon: ChartBarIcon,
      className: 'fill-blue-600 stroke-blue-600', // ← без h-5 w-5
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
      badge:
        overdueCount > 0
          ? { count: overdueCount, variant: 'red' }
          : tasks && tasks.length > 0
            ? { count: tasks.length, variant: 'neutral' }
            : undefined,
    },
    hasAssetModuleAccess
      ? {
          name: t('fleet:asset-management', {
            defaultValue: 'Asset Management',
          }),
          href: `/teams/${slug}/asset`,
          icon: () => <Icon src="/asset-dashboard.png" />,
          className: 'fill-blue-600 stroke-blue-600',
          active: activePathname === `/teams/${slug}/asset`,
        }
      : null,
    canAccess('rpa', ['read'])
      ? {
          name: t('rpa-activities'),
          href: `/teams/${slug}/rpa`,
          icon: () => <Icon src="/unicis-rpa-logo.png" />,
          active:
            activePathname?.startsWith(`/teams/${slug}`) &&
            relativePath.includes('rpa'),
          badge:
            rpaCount > 0 ? { count: rpaCount, variant: 'neutral' } : undefined,
        }
      : null,
    canAccess('tia', ['read'])
      ? {
          name: t('tia'),
          href: `/teams/${slug}/tia`,
          icon: () => <Icon src="/unicis-tia-logo.png" />,
          active:
            activePathname?.startsWith(`/teams/${slug}`) &&
            relativePath.includes('tia'),
          badge:
            tiaCount > 0 ? { count: tiaCount, variant: 'neutral' } : undefined,
        }
      : null,
    canAccess('pia', ['read'])
      ? {
          name: t('pia'),
          href: `/teams/${slug}/pia`,
          icon: () => <Icon src="/unicis-privacy-impact-logo.png" />,
          active:
            activePathname?.startsWith(`/teams/${slug}`) &&
            relativePath.includes('pia'),
          badge:
            piaCount > 0 ? { count: piaCount, variant: 'neutral' } : undefined,
        }
      : null,
    canAccess('csc', ['read'])
      ? {
          name: t('csc'),
          href: `/teams/${slug}/csc`,
          icon: () => <Icon src="/unicis-csc-logo.png" />,
          active:
            activePathname?.startsWith(`/teams/${slug}`) &&
            relativePath.includes('csc'),
          badge:
            openCscCount > 0
              ? { count: openCscCount, variant: 'amber' }
              : undefined,
        }
      : null,
    canAccess('iap_course', ['update'])
      ? {
          name: t('iap'),
          href: `/teams/${slug}/iap`,
          icon: () => <Icon src="/unicis-iap-logo.png" />,
          active:
            activePathname?.startsWith(`/teams/${slug}`) &&
            relativePath.includes('iap') &&
            !relativePath.includes('iap/admin'),
          badge:
            iapCount > 0 ? { count: iapCount, variant: 'neutral' } : undefined,
        }
      : null,
    canAccess('rm', ['read'])
      ? {
          name: t('rm'),
          href: `/teams/${slug}/risk-management`,
          icon: () => <Icon src="/unicis-risk-logo.png" />,
          active:
            activePathname?.startsWith(`/teams/${slug}`) &&
            relativePath.includes('risk-management'),
          badge:
            openRmCount > 0
              ? { count: openRmCount, variant: 'red' }
              : undefined,
        }
      : null,
    { name: 'line-break', href: '' },
    {
      name: t('rest-api-docs'),
      href: '/api-docs',
      icon: DocumentTextIcon,
      className: 'stroke-blue-600',
      openInNewTab: true,
    },
    {
      name: t('documentation'),
      href: 'https://www.unicis.tech/docs',
      icon: CodeBracketIcon,
      className: 'stroke-blue-600',
      openInNewTab: true,
    },
    {
      name: t('knowledge-base'),
      href: 'https://www.unicis.tech/kb',
      icon: LifebuoyIcon,
      className: 'stroke-blue-600',
      openInNewTab: true,
    },
    {
      name: t('feedback'),
      href: 'https://feedback.unicis.tech',
      icon: ChatBubbleBottomCenterTextIcon,
      className: 'stroke-blue-600',
      openInNewTab: true,
    },
    {
      name: t('support'),
      href: 'https://discord.com/invite/8TwyeD97HD',
      icon: QuestionMarkCircleIcon,
      className: 'stroke-blue-600',
      openInNewTab: true,
    },
    // Settings has been moved to the sidebar footer (Navigation.tsx)
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
