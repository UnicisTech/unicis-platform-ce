import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import useISO from 'hooks/useISO';
import { Loading } from '@/components/shared';
import type { Team, ISO } from 'types';
import useCscStatuses from 'hooks/useCscStatuses';
import frameworks from '@/lib/csc/frameworks';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import { cn } from '@/components/shadcn/lib/utils';

// ── Status weight for compliance % computation ────────────────────────────────
const STATUS_WEIGHT: Record<string, number> = {
  'unknown': -1,
  'not-applicable': -1,
  'not-performed': 0,
  'performed-informally': 25,
  'planned': 50,
  'well-defined': 75,
  'quantitatively-controlled': 90,
  'continuously-improving': 100,
};

// ── Ordered status rows for the distribution panel ────────────────────────────
const CSC_STATUS_ROWS: Array<{
  key: string;
  dot: string;
  bar: string;
  badge: string;
}> = [
  {
    key: 'not-performed',
    dot: '#DC2626',
    bar: '#DC2626',
    badge: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
  },
  {
    key: 'performed-informally',
    dot: '#D97706',
    bar: '#D97706',
    badge: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'planned',
    dot: '#CA8A04',
    bar: '#CA8A04',
    badge: 'bg-yellow-50 text-yellow-800',
  },
  {
    key: 'well-defined',
    dot: '#2563EB',
    bar: '#2563EB',
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800',
  },
  {
    key: 'quantitatively-controlled',
    dot: '#7C3AED',
    bar: '#7C3AED',
    badge: 'bg-violet-50 text-violet-700',
  },
  {
    key: 'continuously-improving',
    dot: '#16A34A',
    bar: '#16A34A',
    badge: 'bg-green-50 text-green-700',
  },
];

function progressColor(percent: number): string {
  if (percent >= 75) return '#16A34A';
  if (percent >= 50) return '#D97706';
  return '#DC2626';
}

// ── Inner component (requires resolved cscFrameworks) ─────────────────────────
const TeamCscAnalysis = ({
  slug,
  cscFrameworks,
}: {
  slug: string;
  cscFrameworks: ISO[];
}) => {
  const { t } = useTranslation('common');
  const [activeIso, setActiveIso] = useState<ISO>(cscFrameworks[0]);
  const { statuses } = useCscStatuses(slug, activeIso);

  // Per-section compliance %
  const sectionData = useMemo(() => {
    const fw = frameworks[activeIso];
    if (!fw || !statuses) return [];
    return fw.sections.map((section) => {
      const controls = fw.controls.filter((c) => c.sectionId === section.id);
      const scored = controls
        .map((c) => STATUS_WEIGHT[statuses[c.id] ?? 'unknown'])
        .filter((w) => w >= 0);
      const percent = scored.length
        ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
        : 0;
      return {
        id: section.id,
        label: t(`csc/${activeIso}:sections.${section.id}.label`),
        percent,
      };
    });
  }, [activeIso, statuses, t]);

  // Status distribution counts
  const { counts, total } = useMemo(() => {
    const c: Record<string, number> = {};
    for (const row of CSC_STATUS_ROWS) c[row.key] = 0;
    for (const val of Object.values(statuses ?? {})) {
      const v = val as string;
      if (c[v] !== undefined) c[v]++;
    }
    const sum = Object.values(c).reduce((a, b) => a + b, 0);
    return { counts: c, total: sum || 1 };
  }, [statuses]);

  if (!statuses) return <Loading />;

  return (
    <div>
      {/* Framework filter chips */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {t('framework', { defaultValue: 'Framework' })}:
        </span>
        {cscFrameworks.map((iso) => (
          <button
            key={iso}
            onClick={() => setActiveIso(iso)}
            className={cn(
              'inline-flex items-center text-[11px] font-medium px-2 py-[3px] rounded border transition-colors',
              iso === activeIso
                ? 'bg-ub-blue-bg border-ub-blue-border text-ub-blue-text'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:text-slate-200'
            )}
          >
            {isoValueToLabel(iso)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Section progress */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-slate-900 dark:text-slate-100">
              {t('section-progress', { defaultValue: 'Section progress' })}
            </span>
          </div>
          <div className="space-y-2.5">
            {sectionData.map(({ id, label, percent }) => (
              <div key={id}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500 dark:text-slate-400 truncate mr-2">{label}</span>
                  <span
                    className="font-medium flex-shrink-0"
                    style={{ color: progressColor(percent) }}
                  >
                    {percent}%
                  </span>
                </div>
                <div className="h-[5px] bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percent}%`,
                      background: progressColor(percent),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status distribution */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-slate-900 dark:text-slate-100">
              {t('status-distribution', { defaultValue: 'Status distribution' })}
            </span>
          </div>
          <div className="space-y-2">
            {CSC_STATUS_ROWS.map(({ key, dot, bar, badge }) => {
              const count = counts[key] || 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 min-w-[156px]',
                      badge
                    )}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: dot }}
                    />
                    {t(`statuses.${key}.label`)}
                  </span>
                  <div className="flex-1 h-[5px] bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: bar }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-900 dark:text-slate-100 min-w-[22px] text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── ISO-resolver wrapper (public export) ──────────────────────────────────────
const WithISO = ({ team }: { team: Team }) => {
  const { ISO } = useISO(team);

  if (!ISO) return <Loading />;

  return <TeamCscAnalysis slug={team.slug} cscFrameworks={ISO} />;
};

export default WithISO;
