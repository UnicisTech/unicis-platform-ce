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
import { Error, Loading } from '@/components/shared';
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
import { ShieldAlert, ArrowRight } from 'lucide-react';

// ── Tab types ─────────────────────────────────────────────────────────────────
type DashboardTab = 0 | 1 | 2;

// ── Module row definition for the task matrix ────────────────────────────────
const MODULE_ROWS: Array<{
  key: TaskModuleKey;
  label: string;
  dotColor: string;
  path: string;
}> = [
  { key: 'rpa_procedure', label: 'RPA', dotColor: 'bg-ub-purple', path: 'rpa' },
  { key: 'tia_procedure', label: 'TIA', dotColor: 'bg-sky-400', path: 'tia' },
  { key: 'pia_risk',      label: 'PIA', dotColor: 'bg-ub-green', path: 'pia' },
  { key: 'csc_controls',  label: 'CSC', dotColor: 'bg-ub-blue',  path: 'csc' },
  { key: 'rm_risk',       label: 'Risk', dotColor: 'bg-ub-red',  path: 'risk-management' },
];

const STATUS_COLS: Array<{ key: string; label: string; cellClass: string }> = [
  { key: 'todo',        label: 'To do',      cellClass: 'bg-slate-100 text-slate-600' },
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 min-w-0">
      <div className="px-3 py-2.5 border-b border-slate-200">
        <span className="text-[11px] font-medium text-slate-900">
          {t('dashboard.task-matrix-title')}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-500 w-16">
                Module
              </th>
              {STATUS_COLS.map((col) => (
                <th
                  key={col.key}
                  className="text-center px-2 py-2 text-[10px] font-medium text-slate-500"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-center px-2 py-2 text-[10px] font-medium text-slate-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                onClick={() => router.push(`/teams/${slug}/${row.path}`)}
                className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        row.dotColor
                      )}
                    />
                    <span className="font-medium text-slate-700">
                      {row.label}
                    </span>
                  </div>
                </td>
                {STATUS_COLS.map((col) => (
                  <td key={col.key} className="px-2 py-2 text-center">
                    {row.counts[col.key] > 0 ? (
                      <span
                        className={cn(
                          'inline-block min-w-[20px] px-1.5 py-0.5 rounded text-[10px] font-medium',
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
                <td className="px-2 py-2 text-center text-slate-500 font-medium">
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

  const overdue = useMemo(
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
        )
        .slice(0, 4),
    [tasks]
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden w-full lg:w-[280px] flex-shrink-0">
      <div className="px-3 py-2.5 border-b border-slate-200 flex items-center gap-2">
        <ShieldAlert size={12} className="text-ub-red" aria-hidden />
        <span className="text-[11px] font-medium text-slate-900">
          {t('dashboard.needs-attention')}
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {overdue.length === 0 ? (
          <p className="px-3 py-4 text-[12px] text-slate-400 text-center">
            {t('dashboard.no-overdue')}
          </p>
        ) : (
          overdue.map((task) => (
            <button
              key={task.id}
              onClick={() => router.push(`/teams/${slug}/tasks`)}
              className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] text-slate-700 font-medium leading-snug line-clamp-1">
                  {task.title}
                </p>
                <ArrowRight
                  size={11}
                  className="text-slate-300 mt-0.5 flex-shrink-0"
                />
              </div>
              <p className="text-[10px] text-ub-red mt-0.5">
                Due{' '}
                {new Date(task.duedate as string).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </button>
          ))
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
      {/* KPI strip — 6 summary cards */}
      <KpiRow tasks={tasks || []} slug={slug} team={team} />

      {/* Task matrix + Needs attention */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <TaskStatusMatrix tasks={tasks || []} slug={slug} />
        <NeedsAttentionPanel tasks={tasks || []} slug={slug} />
      </div>

      {/* Tab bar — Direction B segmented pill control */}
      <div
        className="flex gap-0.5 bg-slate-100 rounded-lg p-[3px] mb-4"
        role="tablist"
      >
        {([0, 1, 2] as DashboardTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-[7px] text-center text-[12px] font-medium rounded-md transition-all',
              activeTab === tab
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 bg-transparent border border-transparent'
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab 0: Data protection */}
      {activeTab === 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ProcessingActivitiesAnalysis slug={slug} />
            <TeamAssessmentAnalysis slug={slug} />
          </div>
          <PiaAnalysis tasks={tasks} onCellClick={handlePiaCellClick} />
        </div>
      )}

      {/* Tab 1: Cybersecurity & compliance */}
      {activeTab === 1 && (
        <TeamCscAnalysis team={team} />
      )}

      {/* Tab 2: Risk management */}
      {activeTab === 2 && (
        <RmAnalysis slug={slug} onCellClick={handleRmCellClick} />
      )}
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
