import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import type { ISO } from 'types';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import frameworks from '@/lib/csc/frameworks';
import {
  computeCoverageMatrix,
  type CoverageStats,
} from '@/lib/csc/framework-mapping-utils';

interface MappingMatrixPanelProps {
  enabledFrameworks: ISO[];
}

/** Color band for a coverage percentage */
function coverageColor(pct: number): string {
  if (pct >= 75) return 'bg-success text-success-content';
  if (pct >= 50) return 'bg-warning text-warning-content';
  if (pct >= 25) return 'bg-error/70 text-error-content';
  return 'bg-base-300 text-base-content/50';
}

function coverageBadge(pct: number): string {
  if (pct >= 75) return 'badge-success';
  if (pct >= 50) return 'badge-warning';
  if (pct >= 25) return 'badge-error';
  return 'badge-ghost';
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
        <h3 className="text-sm font-semibold text-base-content mb-3">
          {t('csc-mapping.coverage.title', 'Coverage Analysis')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {enabledFrameworks.map((fw) => {
            const avg = averageCoverage[fw] ?? 0;
            return (
              <div
                key={fw}
                className="rounded-xl border border-base-200 p-3 bg-base-100 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-base-content/70 truncate pr-1">
                    {isoValueToLabel(fw)}
                  </span>
                  <span
                    className={`badge badge-sm flex-shrink-0 ${coverageBadge(avg)}`}
                  >
                    {avg}%
                  </span>
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
                <p className="text-[10px] text-base-content/40 mt-1.5">
                  {t(
                    'csc-mapping.coverage.avg-to-others',
                    'avg. to other frameworks'
                  )}
                </p>
                <p className="text-[10px] text-base-content/40">
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
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-base-content/60"
            >
              <span className={`inline-block w-3 h-3 rounded-sm ${cls}`} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Mapping Matrix Table ────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-base-content mb-3">
          {t('csc-mapping.matrix.title', 'Mapping Matrix')}
        </h3>
        <p className="text-xs text-base-content/50 mb-3">
          {t(
            'csc-mapping.matrix.description',
            'Rows = source framework. Columns = target framework. Cell = % of source controls that have at least one mapping in the target.'
          )}
        </p>

        <div className="overflow-x-auto rounded-xl border border-base-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-base-200/60">
                <th className="px-3 py-2 text-left font-semibold text-base-content/60 whitespace-nowrap border-r border-base-200">
                  {t('csc-mapping.matrix.source', 'Source ↓ / Target →')}
                </th>
                {enabledFrameworks.map((tgt) => (
                  <th
                    key={tgt}
                    className="px-2 py-2 text-center font-semibold text-base-content/60 whitespace-nowrap min-w-[80px]"
                    title={isoValueToLabel(tgt)}
                  >
                    {/* Short label */}
                    {tgt === '2013'
                      ? 'ISO 2013'
                      : tgt === '2022'
                        ? 'ISO 2022'
                        : tgt === 'mvps'
                          ? 'MVSP'
                          : tgt === 'nistcsfv2'
                            ? 'NIST'
                            : tgt === 'eunis2'
                              ? 'NIS2'
                              : tgt === 'gdpr'
                                ? 'GDPR'
                                : tgt === 'cisv81'
                                  ? 'CIS'
                                  : tgt === 'soc2v2'
                                    ? 'SOC2'
                                    : 'C5'}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-semibold text-base-content/60 whitespace-nowrap border-l border-base-200">
                  {t('csc-mapping.matrix.avg', 'Avg')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {enabledFrameworks.map((src) => (
                <tr
                  key={src}
                  className="hover:bg-base-200/20 transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-base-content whitespace-nowrap border-r border-base-200">
                    {isoValueToLabel(src)}
                    <span className="ml-1 text-base-content/40 font-normal">
                      ({frameworkControls[src]?.length ?? 0})
                    </span>
                  </td>
                  {enabledFrameworks.map((tgt) => {
                    if (src === tgt) {
                      return (
                        <td
                          key={tgt}
                          className="px-2 py-2 text-center bg-base-200/40 text-base-content/30"
                        >
                          —
                        </td>
                      );
                    }
                    const stats = cell(src, tgt);
                    const pct = stats?.coveragePercent ?? 0;
                    return (
                      <td key={tgt} className="px-2 py-2 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-semibold text-[11px] ${coverageColor(pct)}`}
                          title={`${stats?.mappedCount ?? 0} / ${stats?.totalControls ?? 0} controls mapped`}
                        >
                          {pct}%
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center border-l border-base-200">
                    <span
                      className={`badge badge-sm font-semibold ${coverageBadge(averageCoverage[src] ?? 0)}`}
                    >
                      {averageCoverage[src] ?? 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
