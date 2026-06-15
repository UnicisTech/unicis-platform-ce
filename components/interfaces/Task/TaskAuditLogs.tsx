import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { UserCircle, Plus, Pencil, MessageSquare, Trash2 } from 'lucide-react';
import type { Task, AuditLog, TaskProperties } from 'types';
import Pagination from '@/components/shadcn/ui/audit-pagination';
import { cn } from '@/components/shadcn/lib/utils';

const ITEMS_PER_PAGE = 20;

// ── i18n maps ─────────────────────────────────────────────────────────────────
const fieldI18nKeys: Record<string, string> = {
  title: 'title',
  status: 'status',
  priority: 'priority',
  duedate: 'due-date',
  description: 'description',
};

const valueI18nPrefixes: Record<string, string> = {
  status: 'task-statuses',
  priority: 'task-priorities',
};

// ── Strip HTML from description diffs ─────────────────────────────────────────
const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ── Icon + colour per event type ──────────────────────────────────────────────
function EventIcon({ event }: { event: string }) {
  const base = 'w-3.5 h-3.5';
  if (event === 'created')
    return <Plus className={cn(base, 'text-emerald-600')} />;
  if (event === 'updated')
    return <Pencil className={cn(base, 'text-blue-500')} />;
  if (event === 'commented')
    return <MessageSquare className={cn(base, 'text-purple-500')} />;
  if (event === 'deleted')
    return <Trash2 className={cn(base, 'text-red-500')} />;
  return <UserCircle className={cn(base, 'text-slate-400')} />;
}

function eventDotCls(event: string): string {
  if (event === 'created') return 'bg-emerald-50 border-emerald-200';
  if (event === 'updated')
    return 'bg-blue-50 dark:bg-blue-950/40 border-blue-200';
  if (event === 'commented') return 'bg-purple-50 border-purple-200';
  if (event === 'deleted')
    return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50';
  return 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700';
}

// ── Relative time ─────────────────────────────────────────────────────────────
function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  const hr = Math.floor(diff / 3_600_000);
  const day = Math.floor(diff / 86_400_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}

// ── Diff chips ────────────────────────────────────────────────────────────────
function DiffChips({
  field,
  prevValue,
  nextValue,
  t,
}: {
  field?: string;
  prevValue?: string | string[];
  nextValue?: string | string[];
  t: (k: string) => string;
}) {
  if (!field || (!prevValue && !nextValue)) return null;

  const fmt = (v: string | string[] | undefined): string => {
    if (!v || v === '—') return '—';
    const s = Array.isArray(v) ? v.join(', ') : v;
    if (field === 'description')
      return stripHtml(s).slice(0, 60) + (s.length > 60 ? '…' : '');
    const prefix = valueI18nPrefixes[field];
    if (prefix) {
      const key = `${prefix}.${s}`;
      const tr = t(key);
      return tr !== key ? tr : s;
    }
    return s;
  };

  const prev = fmt(prevValue);
  const next = fmt(nextValue);

  return (
    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
      {prev !== '—' && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium line-through">
          {prev}
        </span>
      )}
      {prev !== '—' && next !== '—' && (
        <span className="text-slate-400 text-[11px]">→</span>
      )}
      {next !== '—' && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 text-[11px] font-medium">
          {next}
        </span>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const TaskAuditLogs = ({ task }: { task: Task }) => {
  const { t } = useTranslation('common');
  const taskProperties = task?.properties as TaskProperties;
  const auditLogs = (taskProperties?.task_audit_logs || []) as AuditLog[];

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);
  const currentLogs = [...auditLogs]
    .sort((a, b) => b.date - a.date)
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (auditLogs.length === 0) {
    return (
      <p className="text-[13px] text-slate-500 dark:text-slate-400 py-2">
        {t('no-logs-available')}
      </p>
    );
  }

  return (
    <div>
      {/* Timeline */}
      <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-5">
        {currentLogs.map((log, idx) => {
          const fieldLabel = log.diff?.field
            ? t(fieldI18nKeys[log.diff.field] ?? log.diff.field)
            : undefined;

          const eventKey = `task-audit.event-${log.event}`;
          const eventLabel = (() => {
            const tr = t(eventKey);
            return tr !== eventKey ? tr : log.event;
          })();

          return (
            <li key={idx} className="relative pl-7">
              {/* Timeline dot — centered on the border-l line */}
              <span
                className={cn(
                  'absolute -left-[9px] top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border',
                  eventDotCls(log.event)
                )}
              >
                <EventIcon event={log.event} />
              </span>

              {/* Entry body */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Actor */}
                  <span className="text-[12px] font-semibold text-slate-800">
                    {log.actor?.name || t('unknown-user')}
                  </span>

                  {/* Action description */}
                  <span className="text-[12px] text-slate-600 dark:text-slate-300">
                    {log.event === 'created' &&
                      t('task-audit.event-created').toLowerCase()}
                    {log.event === 'updated' && fieldLabel && (
                      <>
                        {eventLabel.toLowerCase()}{' '}
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {fieldLabel}
                        </span>
                      </>
                    )}
                    {log.event === 'updated' &&
                      !fieldLabel &&
                      eventLabel.toLowerCase()}
                    {log.event !== 'created' &&
                      log.event !== 'updated' &&
                      eventLabel.toLowerCase()}
                  </span>

                  {/* Relative time */}
                  <span className="text-[11px] text-slate-400 ml-auto">
                    {relativeTime(log.date)}
                  </span>
                </div>

                {/* Diff chips for updates */}
                {log.diff && (
                  <DiffChips
                    field={log.diff.field}
                    prevValue={log.diff.prevValue}
                    nextValue={log.diff.nextValue}
                    t={t}
                  />
                )}

                {/* Absolute date */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(log.date).toLocaleString()}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default TaskAuditLogs;
