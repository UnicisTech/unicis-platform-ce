import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import type { ISO } from 'types';
import { Badge } from '@/components/shadcn/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import {
  CSC_FRAMEWORK_TO_SHORTNAME,
  isoValueToLabel,
} from '@/lib/csc/csc-frameworks';
import frameworks from '@/lib/csc/frameworks';
import {
  computeCoverageMatrix,
  type CoverageStats,
} from '@/lib/csc/framework-mapping-utils';

interface MappingMatrixPanelProps {
  enabledFrameworks: ISO[];
}

/**
 * Returns Tailwind classes for a coverage badge that match the progress-bar
 * colours in the Coverage Analysis cards (success / warning / error / base-300).
 */
function coverageBadgeClass(pct: number): string {
  if (pct >= 75)
    return 'border-transparent bg-success text-success-content shadow-sm';
  if (pct >= 50)
    return 'border-transparent bg-warning text-warning-content shadow-sm';
  if (pct >= 25)
    return 'border-transparent bg-error/70 text-error-content shadow-sm';
  return 'border-transparent bg-base-300 text-base-content';
}

export default function MappingMatrixPanel({
  enabledFrameworks,
}: MappingMatrixPanelProps) {
  const { t } = useTranslation('common');

  // Build controlId lists per framework from the static framework definitions
  const frameworkControls = useMemo(() => {
    const out: Partial<Record<ISO, string[]>> = {};
    for (const fw of enabledFrameworks) {
      out[fw] = (frameworks[fw]?.controls ?? []).map((c: any) => c.id);
    }
    return out;
  }, [enabledFrameworks]);

  const matrix = useMemo(
    () => computeCoverageMatrix(enabledFrameworks, frameworkControls),
    [enabledFrameworks, frameworkControls]
  );

  // Helper: find stats for a specific src→tgt pair
  const cell = (src: ISO, tgt: ISO): CoverageStats | undefined =>
    matrix.find((s) => s.sourceFramework === src && s.targetFramework === tgt);

  // Overall coverage averages per source framework
  const averageCoverage = useMemo(() => {
    const out: Partial<Record<ISO, number>> = {};
    for (const src of enabledFrameworks) {
      const rows = matrix.filter((s) => s.sourceFramework === src);
      if (rows.length === 0) {
        out[src] = 0;
      } else {
        out[src] = Math.round(
          rows.reduce((sum, r) => sum + r.coveragePercent, 0) / rows.length
        );
      }
    }
    return out;
  }, [enabledFrameworks, matrix]);

  if (enabledFrameworks.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
        <svg
          className="w-12 h-12 mb-3 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M3 14h18M10 3v18M14 3v18"
          />
        </svg>
        <p className="text-sm font-medium">
          {t(
            'csc-mapping.matrix.need-two-frameworks',
            'Enable at least 2 frameworks to see the mapping matrix.'
          )}
        </p>
        <p className="text-xs mt-1">
          {t(
            'csc-mapping.matrix.go-to-settings',
            'Go to Settings → Cybersecurity Settings'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* ── Coverage Analysis Cards ─────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold mb-3">
          {t('csc-mapping.coverage.title', 'Coverage Analysis')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {enabledFrameworks.map((fw) => {
            const avg = averageCoverage[fw] ?? 0;
            return (
              <div key={fw} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold truncate pr-1">
                      {isoValueToLabel(fw)}
                    </span>
                    <Badge
                      className={`flex-shrink-0 ${coverageBadgeClass(avg)}`}
                    >
                      {avg}%
                    </Badge>
                  </div>
                  {/* Mini progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-base-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        avg >= 75
                          ? 'bg-success'
                          : avg >= 50
                            ? 'bg-warning'
                            : avg >= 25
                              ? 'bg-error'
                              : 'bg-base-300'
                      }`}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                  <p className="text-[10px] mt-1.5">
                    {t(
                      'csc-mapping.coverage.avg-to-others',
                      'avg. to other frameworks'
                    )}
                  </p>
                  <p className="text-[10px]">
                    {frameworkControls[fw]?.length ?? 0}{' '}
                    {t('csc-mapping.coverage.total-controls', 'controls')}
                  </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {[
            {
              label: t('csc-mapping.coverage.high', 'High (≥75%)'),
              cls: 'bg-success',
            },
            {
              label: t('csc-mapping.coverage.medium', 'Medium (50–74%)'),
              cls: 'bg-warning',
            },
            {
              label: t('csc-mapping.coverage.low', 'Low (25–49%)'),
              cls: 'bg-error/70',
            },
            {
              label: t('csc-mapping.coverage.minimal', 'Minimal (<25%)'),
              cls: 'bg-base-300',
            },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <span className={`inline-block w-3 h-3 rounded-sm ${cls}`} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Mapping Matrix Table ────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold mb-3">
          {t('csc-mapping.matrix.title', 'Mapping Matrix')}
        </h3>
        <p className="text-xs mb-3">
          {t(
            'csc-mapping.matrix.description',
            'Rows = source framework. Columns = target framework. Cell = % of source controls that have at least one mapping in the target.'
          )}
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <TableHead className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                  {t('csc-mapping.matrix.source', 'Source ↓ / Target →')}
                </TableHead>
                {enabledFrameworks.map((tgt) => (
                  <TableHead
                    key={tgt}
                    className="px-2 py-2 text-center font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[80px]"
                    title={isoValueToLabel(tgt)}
                  >
                    {/* Short label */}
                    {CSC_FRAMEWORK_TO_SHORTNAME[tgt]}
                  </TableHead>
                ))}
                <TableHead className="px-2 py-2 text-center font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap border-l border-slate-200 dark:border-slate-700">
                  {t('csc-mapping.matrix.avg', 'Avg')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
              {enabledFrameworks.map((src) => (
                <TableRow key={src} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <TableCell className="px-3 py-2 font-medium whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                    {isoValueToLabel(src)}
                    <span className="ml-1 text-slate-500 dark:text-slate-400 font-normal">
                      ({frameworkControls[src]?.length ?? 0})
                    </span>
                  </TableCell>
                  {enabledFrameworks.map((tgt) => {
                    if (src === tgt) {
                      return (
                        <TableCell
                          key={tgt}
                          className="px-2 py-2 text-center bg-slate-100/80 text-slate-500 dark:text-slate-400"
                        >
                          —
                        </TableCell>
                      );
                    }
                    const stats = cell(src, tgt);
                    const pct = stats?.coveragePercent ?? 0;
                    return (
                      <TableCell key={tgt} className="px-2 py-2 text-center">
                        <Badge
                          className={`px-1.5 py-0.5 text-[11px] font-semibold ${coverageBadgeClass(pct)}`}
                          title={`${stats?.mappedCount ?? 0} / ${stats?.totalControls ?? 0} controls mapped`}
                        >
                          {pct}%
                        </Badge>
                      </TableCell>
                    );
                  })}
                  <TableCell className="px-2 py-2 text-center border-l border-slate-200 dark:border-slate-700">
                    <Badge
                      className={`font-semibold ${coverageBadgeClass(averageCoverage[src] ?? 0)}`}
                    >
                      {averageCoverage[src] ?? 0}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
