import React, { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Bars3Icon, ChevronRightIcon } from '@heroicons/react/24/outline';
import AccountDropdown from './AccountDropdown';
import NotificationBell from '@/components/notifications/NotificationBell';
import GlobalSearch from './GlobalSearch';
import useTeamTasks from 'hooks/useTeamTasks';
import useIap from 'hooks/useIAP';
import useCscIso from 'hooks/useCscIso';
import useTeam from 'hooks/useTeam';
import frameworks from '@/lib/csc/frameworks';
import { MATRIX_QUERY_VALUE } from '@/components/interfaces/csc/CscTabs';
import type { ISO } from 'types';

// ── Route → display title + record count ─────────────────────────────────────
interface ModuleTitle {
  title: string;
  count: number;
  /** Second breadcrumb segment, e.g. "3 - Task test" on a task detail page */
  subTitle?: string;
  /** href for the {title} segment when a subTitle is present, so it stays a link back */
  titleHref?: string;
}

function useModuleTitle(): ModuleTitle {
  const { t } = useTranslation('common');
  const { asPath, query, isReady } = useRouter();
  const slug = (query.slug as string) || '';

  const { tasks } = useTeamTasks(slug);
  const { teamCourses } = useIap(false, slug);
  const { iso } = useCscIso(slug);
  const { team } = useTeam(slug);

  // Total items per module — mirrors the counts each module's own table shows.
  const { rpaCount, tiaCount, piaCount, rmCount } = useMemo(() => {
    if (!tasks) return { rpaCount: 0, tiaCount: 0, piaCount: 0, rmCount: 0 };
    let rpa = 0;
    let tia = 0;
    let pia = 0;
    let rm = 0;
    for (const task of tasks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props = task.properties as any;
      if (props?.rpa_procedure) rpa++;
      if (props?.tia_procedure) tia++;
      if (props?.pia_risk) pia++;
      if (props?.rm_risk) rm++;
    }
    return { rpaCount: rpa, tiaCount: tia, piaCount: pia, rmCount: rm };
  }, [tasks]);

  // Count controls in the currently selected framework tab only — the tab
  // itself lives in ?framework= (set by Dashboards.tsx) since it's local UI
  // state the Header wouldn't otherwise see. No count on the mapping-matrix
  // tab, which spans every framework rather than a single one.
  const frameworkQuery = query.framework as string | undefined;
  const cscCount = useMemo(() => {
    if (!iso) return 0;
    if (frameworkQuery === MATRIX_QUERY_VALUE) return 0;
    const activeFramework =
      frameworkQuery && iso.includes(frameworkQuery as ISO)
        ? (frameworkQuery as ISO)
        : iso[0];
    return frameworks[activeFramework]?.controls.length ?? 0;
  }, [iso, frameworkQuery]);

  const iapCount = teamCourses?.length ?? 0;

  return useMemo(() => {
    if (!isReady) return { title: '', count: 0 };

    // Global / account routes (no team slug)
    const path = asPath.split('?')[0];
    if (path === '/teams') return { title: t('all-teams'), count: 0 };
    if (path === '/settings/account') return { title: t('profile'), count: 0 };
    if (path === '/settings/password')
      return { title: t('password'), count: 0 };
    if (path === '/notifications')
      return { title: t('notifications.title'), count: 0 };
    if (path === '/notifications/settings')
      return { title: t('notifications.preferences-title'), count: 0 };

    // Team-scoped routes
    if (!slug) return { title: '', count: 0 };
    const relative = path.replace(`/teams/${slug}`, '');
    if (!relative || relative === '/')
      return { title: t('team-dashboard'), count: 0 };
    if (relative.startsWith('/dashboard'))
      return { title: t('team-dashboard'), count: 0 };
    // Task detail page: "All Tasks [count] › 3 - Task name" breadcrumb, in
    // place of the in-content title + breadcrumb every other module dropped.
    const taskDetailMatch = relative.match(/^\/tasks\/(\d+)/);
    if (taskDetailMatch) {
      const matchedTask = tasks?.find(
        (tk) => String(tk.taskNumber) === taskDetailMatch[1]
      );
      return {
        title: t('all-tasks'),
        count: tasks?.length ?? 0,
        subTitle: matchedTask
          ? `${matchedTask.taskNumber} - ${matchedTask.title}`
          : undefined,
        titleHref: `/teams/${slug}/tasks`,
      };
    }
    if (relative.startsWith('/tasks'))
      return { title: t('all-tasks'), count: tasks?.length ?? 0 };
    if (relative.startsWith('/rpa'))
      return { title: t('rpa-activities'), count: rpaCount };
    if (relative.startsWith('/tia'))
      return { title: t('tia'), count: tiaCount };
    if (relative.startsWith('/pia'))
      return { title: t('pia'), count: piaCount };
    if (relative.startsWith('/csc'))
      return { title: t('csc'), count: cscCount };
    if (relative.startsWith('/iap'))
      return { title: t('iap'), count: iapCount };
    if (relative.startsWith('/risk-management'))
      return { title: t('rm'), count: rmCount };
    if (
      /^\/(settings|billing|members|saml|directory-sync|audit-logs|webhooks|api-keys)/.test(
        relative
      )
    )
      return {
        title: team?.name ? `${t('settings')}: ${team.name}` : t('settings'),
        count: 0,
      };
    return { title: '', count: 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isReady,
    asPath,
    slug,
    tasks,
    rpaCount,
    tiaCount,
    piaCount,
    rmCount,
    cscCount,
    iapCount,
    team?.name,
  ]);
}

// ── Component ─────────────────────────────────────────────────────────────────
interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const { title, count, subTitle, titleHref } = useModuleTitle();

  if (status === 'loading') {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 lg:px-6 gap-x-3">
      {/* Left: hamburger + module title — flex-1 so it fills space and title can truncate */}
      <div className="flex items-center gap-x-2.5 flex-1 min-w-0">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-600 dark:text-slate-300 lg:hidden flex-shrink-0"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">{t('open-sidebar')}</span>
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>

        {title && (
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="flex-shrink-0 flex items-center gap-2">
              {titleHref ? (
                <Link
                  href={titleHref}
                  className="text-[14px] font-medium text-slate-900 dark:text-slate-100 tracking-tight hover:underline"
                >
                  {title}
                </Link>
              ) : (
                <span className="text-[14px] font-medium text-slate-900 dark:text-slate-100 tracking-tight">
                  {title}
                </span>
              )}
              {count > 0 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </span>
            {subTitle && (
              <>
                <ChevronRightIcon
                  className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 dark:text-slate-600"
                  aria-hidden="true"
                />
                <span className="truncate text-[14px] font-medium text-slate-900 dark:text-slate-100 tracking-tight">
                  {subTitle}
                </span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Right: search + bell + account — flex-shrink-0 so these never compress */}
      <div className="flex items-center gap-x-3 flex-shrink-0">
        <GlobalSearch />
        <NotificationBell />
        <AccountDropdown />
      </div>
    </div>
  );
};

export default Header;
