import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useTeamTasks from 'hooks/useTeamTasks';
import TasksPieChart from './TasksPieChart';
import { cn } from '@/components/shadcn/lib/utils';
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
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
        {dotClass && (
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotClass)} />
        )}
        {label}
      </div>
      <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5">{pct}%</div>
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
    <div className="flex flex-col lg:flex-row gap-3 mb-3">
      {/* Pie chart card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-center lg:w-[280px] flex-shrink-0">
        <TasksPieChart statuses={statuses} />
      </div>

      {/* Status stat grid */}
      <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6 gap-2 content-start">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 col-span-3 sm:col-span-6 lg:col-span-3 xl:col-span-6">
          <div className="text-[10px] text-slate-400 mb-1">{t('total-tasks')}</div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{total}</div>
        </div>
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
  );
};

export default TasksAnalysis;
