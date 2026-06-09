import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  CheckSquare2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/components/shadcn/lib/utils';
import useISO from 'hooks/useISO';
import useCscStatuses from 'hooks/useCscStatuses';
import useIap from 'hooks/useIAP';
import useTeamMembers from 'hooks/useTeamMembers';
import frameworks from '@/lib/csc/frameworks';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import type { ISO, Task, Team } from 'types';

// ── STATUS_WEIGHT ──────────────────────────────────────────────────────────────
const STATUS_WEIGHT: Record<string, number> = {
  unknown: -1,
  'not-applicable': -1,
  'not-performed': 0,
  'performed-informally': 25,
  planned: 50,
  'well-defined': 75,
  'quantitatively-controlled': 90,
  'continuously-improving': 100,
};

// ── Qualitative label for compliance score ────────────────────────────────────
function scoreLabel(t: (k: string) => string, score: number): { text: string; cls: string } {
  if (score >= 80) return { text: t('dashboard.kpi.score-excellent'), cls: 'text-emerald-600' };
  if (score >= 65) return { text: t('dashboard.kpi.score-good'),      cls: 'text-ub-blue-text' };
  if (score >= 50) return { text: t('dashboard.kpi.score-fair'),      cls: 'text-amber-600' };
  return           { text: t('dashboard.kpi.score-needs-work'),       cls: 'text-red-600 dark:text-red-400' };
}

// ── Presentational KPI card ───────────────────────────────────────────────────
export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'amber' | 'red' | 'green';
  /** Extra Tailwind classes forwarded to the outermost element (e.g. col-span-2) */
  className?: string;
  /** Display value at a larger size — use for the hero compliance card */
  hero?: boolean;
}

export function KpiCard({
  label,
  value,
  sub,
  icon,
  onClick,
  variant = 'default',
  className,
  hero = false,
}: KpiCardProps) {
  const borderCls =
    variant === 'red'
      ? 'border-red-200 dark:border-red-800/50'
      : variant === 'amber'
        ? 'border-amber-200'
        : variant === 'green'
          ? 'border-emerald-200'
          : 'border-slate-200 dark:border-slate-700';

  const iconCls =
    variant === 'red'
      ? 'text-red-400'
      : variant === 'amber'
        ? 'text-amber-400'
        : variant === 'green'
          ? 'text-emerald-500'
          : 'text-slate-400';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-800 border rounded-xl p-3 text-left w-full',
        borderCls,
        onClick && 'hover:border-ub-blue-border transition-colors cursor-pointer',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] mb-1.5">
        <span className={iconCls}>{icon}</span>
        <span className="text-slate-500 dark:text-slate-400 truncate">{label}</span>
      </div>
      <div
        className={cn(
          'font-semibold leading-none text-slate-900 dark:text-slate-100 tabular-nums',
          hero ? 'text-3xl' : 'text-xl'
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight truncate">
          {sub}
        </div>
      )}
    </Tag>
  );
}

// ── CSC inner pair (safe to call hooks since iso is guaranteed) ───────────────
function CscKpiPair({ slug, iso }: { slug: string; iso: ISO }) {
  const { t } = useTranslation('common');
  const { statuses } = useCscStatuses(slug, iso);

  const { complianceScore, gapCount } = useMemo(() => {
    if (!statuses || !frameworks[iso]) return { complianceScore: null, gapCount: null };
    const controls = frameworks[iso].controls ?? [];
    let totalWeight = 0;
    let validCount = 0;
    let gaps = 0;
    for (const ctrl of controls) {
      const s: string = (statuses as Record<string, string>)[ctrl.id] ?? '';
      const w = STATUS_WEIGHT[s] ?? -1;
      if (w >= 0) { totalWeight += w; validCount++; }
      if (!s || s === 'not-performed' || s === 'unknown') gaps++;
    }
    return {
      complianceScore: validCount > 0 ? Math.round(totalWeight / validCount) : null,
      gapCount: gaps,
    };
  }, [statuses, iso]);

  const scoreVariant: KpiCardProps['variant'] =
    complianceScore === null ? 'default'
    : complianceScore >= 75  ? 'green'
    : complianceScore < 50   ? 'red'
    : 'amber';

  const ql = complianceScore !== null ? scoreLabel(t, complianceScore) : null;
  const frameworkName = isoValueToLabel(iso);

  return (
    <>
      {/* Hero compliance card — spans 2 columns on large screens */}
      <KpiCard
        label={t('dashboard.kpi.compliance-score')}
        value={
          complianceScore !== null ? (
            <span className="flex items-baseline gap-2">
              {complianceScore}%
              {ql && (
                <span className={cn('text-[13px] font-medium', ql.cls)}>
                  {ql.text}
                </span>
              )}
            </span>
          ) : '—'
        }
        sub={
          complianceScore !== null
            ? `${t('dashboard.kpi.based-on')} ${frameworkName}`
            : frameworkName
        }
        icon={<ShieldCheck size={12} />}
        variant={scoreVariant}
        className="lg:col-span-2"
        hero
      />

      {/* Cybersecurity gaps card */}
      <KpiCard
        label={t('dashboard.kpi.csc-gaps')}
        value={gapCount !== null ? gapCount : '—'}
        sub={
          gapCount !== null
            ? t('dashboard.kpi.not-performed-controls')
            : t('dashboard.kpi.no-csc-data')
        }
        icon={<ShieldAlert size={12} />}
        variant={gapCount !== null && gapCount > 0 ? 'red' : 'green'}
      />
    </>
  );
}

// ── CSC wrapper — handles ISO loading ─────────────────────────────────────────
function CscKpiCards({ slug, team }: { slug: string; team: Team }) {
  const { t } = useTranslation('common');
  const { ISO: isoList } = useISO(team);
  const activeIso = isoList?.[0] ?? null;

  if (!activeIso) {
    return (
      <>
        <KpiCard
          label={t('dashboard.kpi.compliance-score')}
          value="—"
          sub={t('dashboard.kpi.no-csc-data')}
          icon={<ShieldCheck size={12} />}
          className="lg:col-span-2"
          hero
        />
        <KpiCard
          label={t('dashboard.kpi.csc-gaps')}
          value="—"
          sub={t('dashboard.kpi.no-csc-data')}
          icon={<ShieldAlert size={12} />}
        />
      </>
    );
  }

  return <CscKpiPair slug={slug} iso={activeIso} />;
}

// ── IAP completion card ────────────────────────────────────────────────────────
function IapKpiCard({ slug }: { slug: string }) {
  const { t } = useTranslation('common');
  const { teamCourses } = useIap(false, slug);
  const { members } = useTeamMembers(slug);

  const { pct, completedCount, totalMembers } = useMemo(() => {
    if (!members) return { pct: null, completedCount: null, totalMembers: null };
    const total = members.length;
    if (total === 0) return { pct: 100, completedCount: 0, totalMembers: 0 };
    const completedSet = new Set<string>();
    for (const tc of teamCourses ?? []) {
      for (const prog of tc.progress ?? []) {
        if (prog.progress >= 100) completedSet.add(prog.teamMemberId);
      }
    }
    return {
      pct: Math.round((completedSet.size / total) * 100),
      completedCount: completedSet.size,
      totalMembers: total,
    };
  }, [teamCourses, members]);

  const variant: KpiCardProps['variant'] =
    pct === null ? 'default' : pct >= 75 ? 'green' : pct < 50 ? 'amber' : 'default';

  return (
    <KpiCard
      label={t('dashboard.kpi.iap-completion')}
      value={pct !== null ? `${pct}%` : '—'}
      sub={
        pct !== null && totalMembers !== null
          ? `${completedCount}/${totalMembers} ${t('dashboard.kpi.members')}`
          : undefined
      }
      icon={<BookOpen size={12} />}
      variant={variant}
    />
  );
}

// ── Main KpiRow ────────────────────────────────────────────────────────────────
interface KpiRowProps {
  tasks: Task[];
  slug: string;
  team: Team;
}

export default function KpiRow({ tasks, slug, team }: KpiRowProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const now = new Date();

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'done'),
    [tasks]
  );

  const overdueCount = useMemo(
    () =>
      openTasks.filter(
        (task) => task.duedate && new Date(task.duedate as string) < now
      ).length,
    [openTasks]
  );

  const openRisksCount = useMemo(
    () =>
      tasks.filter((task) => {
        const props = task.properties as Record<string, unknown> | null;
        return task.status !== 'done' && props?.rm_risk;
      }).length,
    [tasks]
  );

  return (
    // 6-col grid: Compliance hero(2) + Open tasks(1) + Open risks(1) + CSC gaps(1) + IAP(1)
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">

      {/* 1+2 · Compliance score (hero, col-span-2) + Cybersecurity gaps — fetches own CSC data */}
      <CscKpiCards slug={slug} team={team} />

      {/* 3 · Open tasks */}
      <KpiCard
        label={t('dashboard.open-tasks')}
        value={openTasks.length}
        sub={
          overdueCount > 0
            ? `${overdueCount} ${t('dashboard.kpi.overdue')}`
            : t('dashboard.no-overdue')
        }
        icon={<CheckSquare2 size={12} />}
        onClick={() => router.push(`/teams/${slug}/tasks`)}
        variant={overdueCount > 0 ? 'amber' : 'default'}
      />

      {/* 4 · Open risks */}
      <KpiCard
        label={t('dashboard.kpi.open-risks')}
        value={openRisksCount}
        sub={
          openRisksCount > 0
            ? t('dashboard.kpi.tasks-with-risk')
            : t('dashboard.kpi.no-open-risks')
        }
        icon={<AlertCircle size={12} />}
        onClick={() => router.push(`/teams/${slug}/risk-management`)}
        variant={openRisksCount > 0 ? 'red' : 'default'}
      />

      {/* 5 · Awareness Training completion — fetches own IAP data */}
      <IapKpiCard slug={slug} />
    </div>
  );
}
