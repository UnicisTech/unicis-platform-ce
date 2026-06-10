import React from 'react';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { cn } from '@/components/shadcn/lib/utils';

export interface SectionRailItem {
  code: string; // section id, e.g. "organizational" or "A.9"
  name: string; // localised label
  percent: number; // 0–100
}

interface SectionRailProps {
  sections: SectionRailItem[];
  activeSection: string | null;
  onSelect: (code: string | null) => void;
}

export function SectionRail({
  sections,
  activeSection,
  onSelect,
}: SectionRailProps) {
  return (
    <aside
      className="hidden lg:flex lg:w-[210px] flex-shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-col overflow-hidden"
      aria-label="Filter by section"
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-700">
        <span className="text-[11px] font-medium text-slate-900 dark:text-slate-100">
          Sections
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Click to filter
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sections.map((sec) => {
          const isActive = activeSection === sec.code;
          const isCritical = sec.percent < 40;
          const isWarning = sec.percent >= 40 && sec.percent < 60;
          return (
            <button
              key={sec.code}
              onClick={() => onSelect(isActive ? null : sec.code)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded-lg transition-colors',
                isActive && 'bg-ub-blue-bg border border-ub-blue-border',
                isCritical && !isActive && 'bg-red-50 dark:bg-red-950/30',
                isWarning && !isActive && 'bg-orange-50',
                !isActive &&
                  !isCritical &&
                  !isWarning &&
                  'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              )}
              aria-pressed={isActive}
              aria-label={`${sec.name} · ${sec.percent}%`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className={cn(
                    'text-[11px] font-medium leading-tight truncate',
                    isActive
                      ? 'text-ub-blue-text'
                      : 'text-slate-700 dark:text-slate-200'
                  )}
                >
                  {sec.name}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-medium flex-shrink-0',
                    sec.percent >= 80
                      ? 'text-ub-green'
                      : sec.percent >= 40
                        ? 'text-ub-amber'
                        : 'text-ub-red'
                  )}
                >
                  {sec.percent}%
                </span>
              </div>
              <ProgressBar
                value={sec.percent}
                showPercent={false}
                height="sm"
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
