import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useTeamTasks from 'hooks/useTeamTasks';
import TasksPieChart from './TasksPieChart';
import { cn } from '@/components/shadcn/lib/utils';
import { QueueListIcon } from '@heroicons/react/24/solid';
import type { Task } from 'types';

// ── Status column config ───────────────────────────────────────────────────────
const STATUS_COLS = [
  { key: 'todo',        labelKey: 'task-statuses.todo',       dotClass: 'bg-slate-400' },
  { key: 'in-progress', labelKey: 'task-statuses.inprogress', dotClass: 'bg-ub-blue' },
  { key: 'in-review',   labelKey: 'task-statuses.inreview',   dotClass: 'bg-ub-purple' },
  { key: 'feedback',    labelKey: 'task-statuses.feedback',   dotClass: 'bg-ub-amber' },
  { key: 'done',        labelKey: 'task-statuses.done',       dotClass: 'bg-ub-green' },
  { key: 'failed',      labelKey: 'task-statuses.failed',     dotClass: 'bg-ub-red' },
];

// ── Mini stat card ─────────────────────────────────────────────────────────────
function StatCard({
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
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
        {dotClass && (
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotClass)} />
        )}
        {label}
      </div>
      <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-slate-400 mt-0.5">{pct}%</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const TasksAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('common');
  const { tasks } = useTeamTasks(slug as string);

  const { statuses, counts } = useMemo(() => {
    if (!tasks) return { statuses: {}, counts: {} };
    const s: Record<string, string> = {};
    const c: Record<string, number> = {};
    for (const col of STATUS_COLS) c[col.key] = 0;
    for (const task of tasks) {
      if (task.status) {
        s[task.id] = task.status;
        const k = task.status.toLowerCase();
        if (c[k] !== undefined) c[k]++;
      }
    }
    return { statuses: s, counts: c };
  }, [tasks]);

  if (!tasks || tasks.length === 0) return null;

  const total = tasks.length;

  return (
    <div className="flex flex-col xl:flex-row gap-3 mb-3">
      {/* Pie chart card — wider, taller */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 xl:w-[420px] flex-shrink-0">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          {t('statuses-title')}
        </div>
        <div className="h-[220px]">
          <TasksPieChart statuses={statuses} />
        </div>
      </div>

      {/* Right column: total card + status grid */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Total Tasks — prominent hero card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
              {t('total-tasks')}
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-none">
              {total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-200/60 dark:bg-blue-800/40 flex items-center justify-center">
            <QueueListIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Status mini-stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2 flex-1">
          {STATUS_COLS.map((col) => (
            <StatCard
              key={col.key}
              label={t(col.labelKey)}
              value={counts[col.key] ?? 0}
              dotClass={col.dotClass}
              total={total}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksAnalysis;
