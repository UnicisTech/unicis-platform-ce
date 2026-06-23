import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import useTeamTasks from 'hooks/useTeamTasks';
import TasksPieChart from './TasksPieChart';
import StatCard from '@/components/shared/StatCard';
import HeroStatCard from '@/components/shared/HeroStatCard';
import { QueueListIcon } from '@heroicons/react/24/solid';

// ── Status column config ───────────────────────────────────────────────────────
const STATUS_COLS = [
  { key: 'todo', labelKey: 'task-statuses.todo', dotClass: 'bg-slate-400' },
  {
    key: 'inprogress',
    labelKey: 'task-statuses.inprogress',
    dotClass: 'bg-ub-blue',
  },
  {
    key: 'inreview',
    labelKey: 'task-statuses.inreview',
    dotClass: 'bg-ub-purple',
  },
  {
    key: 'feedback',
    labelKey: 'task-statuses.feedback',
    dotClass: 'bg-ub-amber',
  },
  { key: 'done', labelKey: 'task-statuses.done', dotClass: 'bg-ub-green' },
  { key: 'failed', labelKey: 'task-statuses.failed', dotClass: 'bg-ub-red' },
];

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
        <HeroStatCard
          label={t('total-tasks')}
          value={total}
          icon={
            <QueueListIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          }
        />

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
