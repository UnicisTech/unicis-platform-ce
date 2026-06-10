import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  TeamAssessmentAnalysis,
  TeamCscAnalysis,
  PiaAnalysis,
} from '@/components/interfaces/TeamDashboard';
import RmAnalysis from '@/components/interfaces/TeamDashboard/RmAnalysis';
import ProcessingActivitiesAnalysis from '@/components/interfaces/TeamDashboard/TeamProcessingActivities';
import KpiRow from '@/components/interfaces/TeamDashboard/KpiRow';
import DomainHealthRow from '@/components/interfaces/TeamDashboard/DomainHealthRow';
import ActionRequiredBanner from '@/components/interfaces/TeamDashboard/ActionRequiredBanner';
import { Error, Loading } from '@/components/shared';
import ModuleBadge from '@/components/shared/ModuleBadge';
import { Button } from '@/components/shadcn/ui/button';
import { getTeamAccess } from '@/lib/teams';
import { getTranslationNamespaces } from '@/lib/i18n/getCscTranslationNamespaces';
import useTeam from 'hooks/useTeam';
import useTeamTasks from 'hooks/useTeamTasks';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ISO, Task } from 'types';
import { cn } from '@/components/shadcn/lib/utils';
import { hasTaskModule, isTaskModuleKey } from '@/lib/tasks';
import type { TaskModuleKey } from '@/lib/tasks';
import { ShieldAlert, ArrowRight, Download } from 'lucide-react';

// ── CSV export ────────────────────────────────────────────────────────────────
function exportTasksCsv(tasks: Task[], slug: string) {
  const now = new Date();
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Due Date', 'Overdue'];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const rows = tasks.map((task) => {
    const isOverdue =
      task.status !== 'done' &&
      task.duedate &&
      new Date(task.duedate as string) < now;
    return [
      task.taskNumber ?? task.id,
      escape(task.title),
      task.status ?? '',
      task.priority ?? '',
      task.duedate
        ? new Date(task.duedate as string).toLocaleDateString()
        : '',
      isOverdue ? 'Yes' : 'No',
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Tab types ─────────────────────────────────────────────────────────────────
type DashboardTab = 0 | 1 | 2;

// ── Module row definition for the task matrix ────────────────────────────────
const MODULE_ROWS: Array<{
  key: TaskModuleKey;
  path: string;
}> = [
  { key: 'rpa_procedure', path: 'rpa' },
  { key: 'tia_procedure', path: 'tia' },
  { key: 'pia_risk',      path: 'pia' },
  { key: 'csc_controls',  path: 'csc' },
  { key: 'rm_risk',       path: 'risk-management' },
];

const STATUS_COLS: Array<{ key: string; label: string; cellClass: string }> = [
  { key: 'todo',        label: 'To do',      cellClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
  { key: 'in-progress', label: 'In progress', cellClass: 'bg-ub-blue-bg text-ub-blue-text' },
  { key: 'in-review',   label: 'In review',  cellClass: 'bg-ub-purple-bg text-ub-purple-text' },
  { key: 'feedback',    label: 'Feedback',   cellClass: 'bg-ub-amber-bg text-ub-amber-text' },
  { key: 'done',        label: 'Done',       cellClass: 'bg-ub-green-bg text-ub-green-text' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function TaskStatusMatrix({
  tasks,
  slug,
}: {
  tasks: Task[];
  slug: string;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();

  const rows = useMemo(
    () =>
      MODULE_ROWS.map((mod) => {
        const moduleTasks = tasks.filter((task) => {
          const props = task.properties as Record<string, unknown>;
          return isTaskModuleKey(mod.key) && hasTaskModule(props, mod.key);
        });
        const counts: Record<string, number> = {};
        for (const col of STATUS_COLS) {
          counts[col.key] = moduleTasks.filter(
            (task) => task.status === col.key
          ).length;
        }
        return { ...mod, counts, total: moduleTasks.length };
      }),
    [tasks]
  );

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex-1 min-w-0">
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {t('dashboard.task-matrix-title')}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-3 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 w-16">
                Module
              </th>
              {STATUS_COLS.map((col) => (
                <th
                  key={col.key}
                  className="text-center px-2 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-center px-2 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                onClick={() => router.push(`/teams/${slug}/${row.path}`)}
                className="border-b border-slate-50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2">
                  <ModuleBadge propName={row.key} />
                </td>
                {STATUS_COLS.map((col) => (
                  <td key={col.key} className="px-2 py-2 text-center">
                    {row.counts[col.key] > 0 ? (
                      <span
                        className={cn(
                          'inline-block min-w-[20px] px-1.5 py-0.5 rounded text-[11px] font-medium',
                          col.cellClass
                        )}
                      >
                        {row.counts[col.key]}
                      </span>
                    ) : (
                      <span className="text-slate-200">—</span>
                    )}
                  </td>
                ))}
                <td className="px-2 py-2 text-center text-slate-500 dark:text-slate-400 font-medium">
                  {row.total || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ATTENTION_LIMIT = 4;

function NeedsAttentionPanel({
  tasks,
  slug,
}: {
  tasks: Task[];
  slug: string;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const now = new Date();

  const allOverdue = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            task.status !== 'done' &&
            task.duedate &&
            new Date(task.duedate as string) < now
        )
        .sort(
          (a, b) =>
            new Date(a.duedate as string).getTime() -
            new Date(b.duedate as string).getTime()
        ),
    [tasks]
  );

  const shown = allOverdue.slice(0, ATTENTION_LIMIT);
  const hiddenCount = allOverdue.length - shown.length;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden w-full lg:w-[280px] flex-shrink-0">
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
        <ShieldAlert size={12} className="text-ub-red" aria-hidden />
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {t('dashboard.needs-attention')}
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {shown.length === 0 ? (
          <p className="px-3 py-4 text-[12px] text-slate-400 text-center">
            {t('dashboard.no-overdue')}
          </p>
        ) : (
          <>
            {shown.map((task) => {
              const dueLabel = new Date(task.duedate as string).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric' }
              );
              return (
                <button
                  key={task.id}
                  aria-label={`${task.title}, ${t('dashboard.overdue-tasks')} ${dueLabel}`}
                  onClick={() => router.push(`/teams/${slug}/tasks/${task.taskNumber}`)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] text-slate-700 dark:text-slate-200 font-medium leading-snug line-clamp-1">
                      {task.title}
                    </p>
                    <ArrowRight
                      size={11}
                      className="text-slate-300 mt-0.5 flex-shrink-0"
                      aria-hidden
                    />
                  </div>
                  <p className="text-[11px] text-ub-red mt-0.5">
                    Due {dueLabel}
                  </p>
                </button>
              );
            })}
            {hiddenCount > 0 && (
              <button
                onClick={() => router.push(`/teams/${slug}/tasks`)}
                className="w-full px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-center transition-colors"
                aria-label={t('dashboard.overdue-tasks')}
              >
                +{hiddenCount} more →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TeamDashboard = ({
  slug,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isLoading: teamLoading, isError: teamError, team } = useTeam();
  const {
    tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTeamTasks(slug);

  const [activeTab, setActiveTab] = useState<DashboardTab>(0);

  const handlePiaCellClick = useCallback(
    (category: number, x: number, y: number) => {
      router.push(`/teams/${slug}/pia?category=${category}&ix=${x}&iy=${y}`);
    },
    [router, slug]
  );

  const handleRmCellClick = useCallback(
    (x: number, y: number) => {
      router.push(`/teams/${slug}/risk-management?ix=${x}&iy=${y}`);
    },
    [router, slug]
  );

  if (teamLoading || tasksLoading) {
    return <Loading />;
  }

  if (teamError || tasksError) {
    return <Error message={teamError?.message || tasksError?.message} />;
  }

  if (!team) {
    return <Error message={t('errors.teamNotFound')} />;
  }

  const TAB_LABELS: Record<DashboardTab, string> = {
    0: t('dashboard.tab.data-protection'),
    1: t('dashboard.tab.cybersecurity'),
    2: t('dashboard.tab.risk'),
  };

  return (
    <>
      {/* Top bar: compact alert (only when issues) + Export CSV always on right */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <ActionRequiredBanner tasks={tasks || []} slug={slug} team={team} />
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 text-slate-600 dark:text-slate-300 ml-auto"
          onClick={() => exportTasksCsv(tasks || [], slug)}
          disabled={!tasks || tasks.length === 0}
          title={t('dashboard.export-csv')}
        >
          <Download size={13} className="mr-1.5" aria-hidden />
          {t('dashboard.export-csv')}
        </Button>
      </div>

      {/* KPI strip — 6 summary cards */}
      <KpiRow tasks={tasks || []} slug={slug} team={team} />

      {/* Task matrix + Needs attention */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <TaskStatusMatrix tasks={tasks || []} slug={slug} />
        <NeedsAttentionPanel tasks={tasks || []} slug={slug} />
      </div>

      {/* Domain health row — 3 clickable cards that switch tabs */}
      <DomainHealthRow
        tasks={tasks || []}
        slug={slug}
        team={team}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab bar — Direction B segmented pill control */}
      <div
        className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px] mb-4"
        role="tablist"
        aria-label={t('dashboard.tab.aria-label')}
      >
        {([0, 1, 2] as DashboardTab[]).map((tab) => (
          <button
            key={tab}
            id={`dashboard-tab-${tab}`}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`dashboard-tabpanel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-[7px] text-center text-[12px] font-medium rounded-md transition-all',
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-transparent border border-transparent'
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab 0: Data protection */}
      <div
        id="dashboard-tabpanel-0"
        role="tabpanel"
        aria-labelledby="dashboard-tab-0"
        hidden={activeTab !== 0}
      >
        {activeTab === 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ProcessingActivitiesAnalysis slug={slug} />
              <TeamAssessmentAnalysis slug={slug} />
            </div>
            <PiaAnalysis tasks={tasks} onCellClick={handlePiaCellClick} />
          </div>
        )}
      </div>

      {/* Tab 1: Cybersecurity & compliance */}
      <div
        id="dashboard-tabpanel-1"
        role="tabpanel"
        aria-labelledby="dashboard-tab-1"
        hidden={activeTab !== 1}
      >
        {activeTab === 1 && <TeamCscAnalysis team={team} />}
      </div>

      {/* Tab 2: Risk management */}
      <div
        id="dashboard-tabpanel-2"
        role="tabpanel"
        aria-labelledby="dashboard-tab-2"
        hidden={activeTab !== 2}
      >
        {activeTab === 2 && (
          <RmAnalysis slug={slug} onCellClick={handleRmCellClick} />
        )}
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, query, req, res }: GetServerSidePropsContext = context;
  const slug = query.slug as string;

  const access = await getTeamAccess(req, res, query);

  if (!access) {
    return {
      notFound: true,
    };
  }

  const frameworks = (access.teamProperties?.csc_iso ?? []) as ISO[];
  const cscTranslations = getTranslationNamespaces(frameworks);

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, [
            'common',
            'rpa',
            'tia',
            'pia',
            'rm',
            ...cscTranslations,
          ])
        : {}),
      teamFeatures: access.teamFeatures,
      slug: slug,
    },
  };
}

export default TeamDashboard;
