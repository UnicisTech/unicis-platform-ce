import React from 'react';

/** Prominent blue "hero" total card — Direction B, used above a StatCard grid. */
export default function HeroStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
          {label}
        </div>
        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-none">
          {value}
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-blue-200/60 dark:bg-blue-800/40 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
    </div>
  );
}
