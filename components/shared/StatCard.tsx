import { cn } from '@/components/shadcn/lib/utils';

/** Mini stat card: dot + label, big value, and value as a % of total. Direction B. */
export default function StatCard({
  label,
  value,
  dotClass,
  total,
}: {
  label: string;
  value: number;
  dotClass?: string;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
        {dotClass && (
          <span
            className={cn('w-2 h-2 rounded-full flex-shrink-0', dotClass)}
          />
        )}
        {label}
      </div>
      <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
        {pct}%
      </div>
    </div>
  );
}
