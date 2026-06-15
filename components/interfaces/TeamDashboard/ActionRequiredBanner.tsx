import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AlertTriangle } from 'lucide-react';
import useISO from 'hooks/useISO';
import useCscStatuses from 'hooks/useCscStatuses';
import frameworks from '@/lib/csc/frameworks';
import type { ISO, Task, Team } from 'types';

// ── Shared weight table (mirrors KpiRow) ──────────────────────────────────────
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

// ── Shared count helpers ──────────────────────────────────────────────────────
function computeOverdue(tasks: Task[]): number {
  const now = new Date();
  return tasks.filter(
    (t) =>
      t.status !== 'done' && t.duedate && new Date(t.duedate as string) < now
  ).length;
}

function computeOpenRisks(tasks: Task[]): number {
  return tasks.filter((t) => {
    const props = t.properties as Record<string, unknown> | null;
    return t.status !== 'done' && props?.rm_risk;
  }).length;
}

// ── Banner shell ──────────────────────────────────────────────────────────────
function BannerShell({
  parts,
  isCritical,
  slug,
}: {
  parts: string[];
  isCritical: boolean;
  slug: string;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();

  if (parts.length === 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border text-sm ${
        isCritical
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
      }`}
      role="alert"
    >
      <AlertTriangle
        size={13}
        className={`flex-shrink-0 ${
          isCritical
            ? 'text-red-500 dark:text-red-400'
            : 'text-amber-500 dark:text-amber-400'
        }`}
        aria-hidden
      />
      <span
        className={`text-[12px] font-medium ${
          isCritical
            ? 'text-red-800 dark:text-red-300'
            : 'text-amber-800 dark:text-amber-300'
        }`}
      >
        {parts.join(' · ')}
      </span>
      <button
        className={`text-[12px] font-medium underline-offset-2 hover:underline flex-shrink-0 ${
          isCritical
            ? 'text-red-700 dark:text-red-400'
            : 'text-amber-700 dark:text-amber-400'
        }`}
        onClick={() => router.push(`/teams/${slug}/tasks`)}
      >
        {t('dashboard.banner.review')} →
      </button>
    </div>
  );
}

// ── With CSC data — only mounted when activeIso is known ─────────────────────
function BannerWithCsc({
  tasks,
  slug,
  iso,
}: {
  tasks: Task[];
  slug: string;
  iso: ISO;
}) {
  const { t } = useTranslation('common');
  const { statuses } = useCscStatuses(slug, iso);

  const { overdueCount, openRisksCount, complianceScore } = useMemo(() => {
    const complianceFramework = frameworks[iso];
    let score: number | null = null;
    if (statuses && complianceFramework) {
      const controls = complianceFramework.controls ?? [];
      let totalWeight = 0;
      let validCount = 0;
      for (const ctrl of controls) {
        const s: string = (statuses as Record<string, string>)[ctrl.id] ?? '';
        const w = STATUS_WEIGHT[s] ?? -1;
        if (w >= 0) {
          totalWeight += w;
          validCount++;
        }
      }
      score = validCount > 0 ? Math.round(totalWeight / validCount) : null;
    }
    return {
      overdueCount: computeOverdue(tasks),
      openRisksCount: computeOpenRisks(tasks),
      complianceScore: score,
    };
  }, [tasks, statuses, iso]);

  const isCritical = complianceScore !== null && complianceScore < 50;
  const parts: string[] = [];
  if (overdueCount > 0)
    parts.push(`${overdueCount} ${t('dashboard.banner.overdue-tasks')}`);
  if (openRisksCount > 0)
    parts.push(`${openRisksCount} ${t('dashboard.banner.open-risks')}`);
  if (isCritical && complianceScore !== null)
    parts.push(`${t('dashboard.banner.compliance-at')} ${complianceScore}%`);

  return <BannerShell parts={parts} isCritical={isCritical} slug={slug} />;
}

// ── Without CSC data — shows overdue + risks only ────────────────────────────
function BannerNoCsc({ tasks, slug }: { tasks: Task[]; slug: string }) {
  const { t } = useTranslation('common');

  const { overdueCount, openRisksCount } = useMemo(
    () => ({
      overdueCount: computeOverdue(tasks),
      openRisksCount: computeOpenRisks(tasks),
    }),
    [tasks]
  );

  const parts: string[] = [];
  if (overdueCount > 0)
    parts.push(`${overdueCount} ${t('dashboard.banner.overdue-tasks')}`);
  if (openRisksCount > 0)
    parts.push(`${openRisksCount} ${t('dashboard.banner.open-risks')}`);

  return <BannerShell parts={parts} isCritical={false} slug={slug} />;
}

// ── Public component — ISO decides which inner to render ─────────────────────
export default function ActionRequiredBanner({
  tasks,
  slug,
  team,
}: {
  tasks: Task[];
  slug: string;
  team: Team;
}) {
  const { ISO: isoList } = useISO(team);
  const activeIso = isoList?.[0] ?? null;

  if (activeIso) {
    return <BannerWithCsc tasks={tasks} slug={slug} iso={activeIso} />;
  }
  return <BannerNoCsc tasks={tasks} slug={slug} />;
}
