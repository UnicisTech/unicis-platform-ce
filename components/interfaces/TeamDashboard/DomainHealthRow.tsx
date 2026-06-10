import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { ShieldCheck, Lock, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/components/shadcn/lib/utils';
import useISO from 'hooks/useISO';
import useCscStatuses from 'hooks/useCscStatuses';
import frameworks from '@/lib/csc/frameworks';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import {
  calculateRiskRating,
  calculateCurrentRiskRating,
} from '@/lib/rm/helpers';
import type { ISO, Task, Team, TaskProperties, RMProcedureInterface } from 'types';

// ── Types ──────────────────────────────────────────────────────────────────────
type DashboardTab = 0 | 1 | 2;

interface DomainHealthRowProps {
  tasks: Task[];
  slug: string;
  team: Team;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

type HealthStatus = 'healthy' | 'warning' | 'critical' | 'empty';

// ── Shared CSC weight ──────────────────────────────────────────────────────────
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

// ── Domain card ────────────────────────────────────────────────────────────────
interface DomainCardProps {
  title: string;
  metric: string;
  sub: string;
  status: HealthStatus;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  /** Accessible label describing the action, e.g. "Switch to Data Protection tab" */
  actionLabel: string;
}

const statusStyles: Record<HealthStatus, { dot: string; card: string; metric: string }> = {
  healthy: {
    dot: 'bg-green-500',
    card: 'border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700',
    metric: 'text-green-700 dark:text-green-400',
  },
  warning: {
    dot: 'bg-amber-500',
    card: 'border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700',
    metric: 'text-amber-700 dark:text-amber-400',
  },
  critical: {
    dot: 'bg-red-500',
    card: 'border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700',
    metric: 'text-red-700 dark:text-red-400',
  },
  empty: {
    dot: 'bg-slate-300 dark:bg-slate-600',
    card: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
    metric: 'text-slate-500 dark:text-slate-400',
  },
};

function DomainCard({
  title,
  metric,
  sub,
  status,
  icon,
  active,
  onClick,
  actionLabel,
}: DomainCardProps) {
  const styles = statusStyles[status];

  return (
    <button
      onClick={onClick}
      aria-label={actionLabel}
      aria-pressed={active}
      className={cn(
        'flex-1 min-w-0 bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 text-left transition-all cursor-pointer group',
        styles.card,
        active && 'ring-2 ring-offset-1 ring-ub-blue-border'
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', styles.dot)} />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </span>
        </div>
        <ChevronRight
          size={12}
          className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"
          aria-hidden
        />
      </div>

      {/* Metric */}
      <div className={cn('text-[15px] font-semibold leading-tight mb-0.5', styles.metric)}>
        {metric}
      </div>

      {/* Sub */}
      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
        <span className="flex-shrink-0">{icon}</span>
        <span className="truncate">{sub}</span>
      </div>
    </button>
  );
}

// ── Data Protection domain ─────────────────────────────────────────────────────
function DataProtectionCard({
  tasks,
  active,
  onClick,
}: {
  tasks: Task[];
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation('common');

  const { tiaTotal, tiaAtRisk, rpaTotal } = useMemo(() => {
    let tia = 0;
    let atRisk = 0;
    let rpa = 0;

    for (const task of tasks) {
      const props = task.properties as TaskProperties | null;
      if (Array.isArray(props?.tia_procedure)) {
        tia++;
        // Not permitted if any step has TransferMechanism !== 'yes' and no explicit override
        const proc = props!.tia_procedure as any[];
        const isAuthorized = proc.some((p) => p.TransferMechanism === 'yes');
        if (!isAuthorized) atRisk++;
      }
      if (Array.isArray(props?.rpa_procedure)) rpa++;
    }

    return { tiaTotal: tia, tiaAtRisk: atRisk, rpaTotal: rpa };
  }, [tasks]);

  const hasData = tiaTotal > 0 || rpaTotal > 0;
  const status: HealthStatus =
    !hasData ? 'empty'
    : tiaAtRisk > 0 ? 'critical'
    : 'healthy';

  const metric =
    !hasData
      ? t('domain-health.no-data', { defaultValue: 'No data yet' })
      : tiaAtRisk > 0
      ? `${tiaAtRisk} ${t('domain-health.transfers-at-risk', { defaultValue: 'transfer(s) at risk' })}`
      : t('domain-health.transfers-ok', { defaultValue: 'Transfers OK' });

  const sub = hasData
    ? `${tiaTotal} TIA · ${rpaTotal} ${t('domain-health.rpa-records', { defaultValue: 'RPA records' })}`
    : t('domain-health.start-adding', { defaultValue: 'Start adding TIA / RPA records' });

  return (
    <DomainCard
      title={t('domain-health.data-protection', { defaultValue: 'Data Protection' })}
      metric={metric}
      sub={sub}
      status={status}
      icon={<Lock size={10} aria-hidden />}
      active={active}
      onClick={onClick}
      actionLabel={t('domain-health.switch-tab-data-protection', { defaultValue: 'Switch to Data Protection tab' })}
    />
  );
}

// ── Cybersecurity domain (needs ISO + CSC hooks) ───────────────────────────────
function CybersecurityCardInner({
  slug,
  iso,
  active,
  onClick,
}: {
  slug: string;
  iso: ISO;
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation('common');
  const { statuses } = useCscStatuses(slug, iso);

  const { complianceScore, gapCount } = useMemo(() => {
    if (!statuses || !frameworks[iso])
      return { complianceScore: null, gapCount: null };
    const controls = frameworks[iso].controls ?? [];
    let totalWeight = 0;
    let validCount = 0;
    let gaps = 0;
    for (const ctrl of controls) {
      const s: string = (statuses as Record<string, string>)[ctrl.id] ?? '';
      const w = STATUS_WEIGHT[s] ?? -1;
      if (w >= 0) {
        totalWeight += w;
        validCount++;
      }
      if (!s || s === 'not-performed' || s === 'unknown') gaps++;
    }
    return {
      complianceScore: validCount > 0 ? Math.round(totalWeight / validCount) : null,
      gapCount: gaps,
    };
  }, [statuses, iso]);

  const status: HealthStatus =
    complianceScore === null ? 'empty'
    : complianceScore >= 75  ? 'healthy'
    : complianceScore >= 50  ? 'warning'
    : 'critical';

  const metric =
    complianceScore !== null ? `${complianceScore}%` : '—';

  const sub = complianceScore !== null
    ? `${gapCount} ${t('domain-health.gaps', { defaultValue: 'gaps' })} · ${isoValueToLabel(iso)}`
    : isoValueToLabel(iso);

  return (
    <DomainCard
      title={t('domain-health.cybersecurity', { defaultValue: 'Cybersecurity' })}
      metric={metric}
      sub={sub}
      status={status}
      icon={<ShieldCheck size={10} aria-hidden />}
      active={active}
      onClick={onClick}
      actionLabel={t('domain-health.switch-tab-cybersecurity', { defaultValue: 'Switch to Cybersecurity tab' })}
    />
  );
}

function CybersecurityCard({
  slug,
  team,
  active,
  onClick,
}: {
  slug: string;
  team: Team;
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation('common');
  const { ISO: isoList } = useISO(team);
  const activeIso = isoList?.[0] ?? null;

  if (!activeIso) {
    return (
      <DomainCard
        title={t('domain-health.cybersecurity', { defaultValue: 'Cybersecurity' })}
        metric="—"
        sub={t('domain-health.no-csc-framework', { defaultValue: 'No CSC framework configured' })}
        status="empty"
        icon={<ShieldCheck size={10} aria-hidden />}
        active={active}
        onClick={onClick}
        actionLabel={t('domain-health.switch-tab-cybersecurity', { defaultValue: 'Switch to Cybersecurity tab' })}
      />
    );
  }

  return (
    <CybersecurityCardInner
      slug={slug}
      iso={activeIso}
      active={active}
      onClick={onClick}
    />
  );
}

// ── Risk Management domain ─────────────────────────────────────────────────────
function RiskCard({
  tasks,
  active,
  onClick,
}: {
  tasks: Task[];
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation('common');

  const { extreme, major, total } = useMemo(() => {
    let ext = 0;
    let maj = 0;
    let tot = 0;

    for (const task of tasks) {
      const props = task.properties as TaskProperties | null;
      const risk = props?.rm_risk as RMProcedureInterface | undefined;
      if (!risk) continue;
      tot++;

      const raw = calculateRiskRating(risk[0].RawProbability, risk[0].RawImpact);
      const target = calculateRiskRating(
        risk[1].TreatedProbability,
        risk[1].TreatedImpact
      );
      const current = calculateCurrentRiskRating(raw, target, risk[1].TreatmentStatus);

      if (current >= 80) ext++;
      else if (current >= 60) maj++;
    }

    return { extreme: ext, major: maj, total: tot };
  }, [tasks]);

  const status: HealthStatus =
    total === 0    ? 'empty'
    : extreme > 0  ? 'critical'
    : major > 0    ? 'warning'
    : 'healthy';

  const metric =
    total === 0
      ? t('domain-health.no-data', { defaultValue: 'No data yet' })
      : extreme + major > 0
      ? `${extreme + major} ${t('domain-health.high-risks', { defaultValue: 'high risks' })}`
      : t('domain-health.risks-managed', { defaultValue: 'Risks managed' });

  const sub =
    total > 0
      ? extreme > 0
        ? `${extreme} ${t('risk-level-extreme')} · ${major} ${t('risk-level-major')}`
        : `${total} ${t('domain-health.risks-total', { defaultValue: 'risks tracked' })}`
      : t('domain-health.start-adding-risks', { defaultValue: 'Start adding risks' });

  return (
    <DomainCard
      title={t('domain-health.risk-management', { defaultValue: 'Risk Management' })}
      metric={metric}
      sub={sub}
      status={status}
      icon={<AlertTriangle size={10} aria-hidden />}
      active={active}
      onClick={onClick}
      actionLabel={t('domain-health.switch-tab-risk', { defaultValue: 'Switch to Risk Management tab' })}
    />
  );
}

// ── Public export ──────────────────────────────────────────────────────────────
export default function DomainHealthRow({
  tasks,
  slug,
  team,
  activeTab,
  onTabChange,
}: DomainHealthRowProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <DataProtectionCard
        tasks={tasks}
        active={activeTab === 0}
        onClick={() => onTabChange(0)}
      />
      <CybersecurityCard
        slug={slug}
        team={team}
        active={activeTab === 1}
        onClick={() => onTabChange(1)}
      />
      <RiskCard
        tasks={tasks}
        active={activeTab === 2}
        onClick={() => onTabChange(2)}
      />
    </div>
  );
}
