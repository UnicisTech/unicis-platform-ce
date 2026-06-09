/**
 * AuditTimeline — shared Direction B timeline used by all module audit logs.
 *
 * Each module passes its own log array and an optional `renderDiff` for
 * module-specific value formatting.  When no `renderDiff` is provided the
 * component falls back to raw prev → next string chips.
 */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Plus, Pencil, Trash2, Minus, RefreshCw } from 'lucide-react';
import { cn } from '@/components/shadcn/lib/utils';
import Pagination from '@/components/shadcn/ui/audit-pagination';

const ITEMS_PER_PAGE = 20;

// ── Generic log shape ─────────────────────────────────────────────────────────
export interface TimelineLog {
  date: number;
  actor?: { id?: string; name?: string } | null;
  event: string;
  diff?: {
    field?: string;
    prevValue?: string | string[] | null;
    nextValue?: string | string[] | null;
  } | null;
}

// ── Event icon ────────────────────────────────────────────────────────────────
function EventIcon({ event }: { event: string }) {
  const base = 'w-3.5 h-3.5';
  const e = event.toLowerCase();
  if (e === 'created' || e === 'added')
    return <Plus className={cn(base, 'text-emerald-600')} />;
  if (e === 'updated')
    return <Pencil className={cn(base, 'text-blue-500')} />;
  if (e === 'deleted')
    return <Trash2 className={cn(base, 'text-red-500')} />;
  if (e === 'removed')
    return <Minus className={cn(base, 'text-red-500')} />;
  return <RefreshCw className={cn(base, 'text-slate-400')} />;
}

function eventDotCls(event: string): string {
  const e = event.toLowerCase();
  if (e === 'created' || e === 'added')
    return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50';
  if (e === 'updated')
    return 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50';
  if (e === 'deleted' || e === 'removed')
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

// ── Default diff chips (raw string values) ────────────────────────────────────
function DefaultDiffChips({
  prevValue,
  nextValue,
}: {
  prevValue?: string | string[] | null;
  nextValue?: string | string[] | null;
}) {
  const fmt = (v: string | string[] | null | undefined) => {
    if (!v) return null;
    return Array.isArray(v) ? v.join(', ') : v;
  };
  const prev = fmt(prevValue);
  const next = fmt(nextValue);
  if (!prev && !next) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
      {prev && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium line-through">
          {prev}
        </span>
      )}
      {prev && next && (
        <span className="text-slate-400 text-[11px]">→</span>
      )}
      {next && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
          {next}
        </span>
      )}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
interface AuditTimelineProps<T extends TimelineLog> {
  logs: T[];
  membersById?: Map<string, string>;
  /** Override the diff section for a single entry (module-specific formatting) */
  renderDiff?: (log: T) => React.ReactNode;
  /** Translate the event verb (e.g. t('added') → 'added') */
  translateEvent?: (event: string) => string;
  /** Translate the field name (e.g. 'category' → 'Category') */
  translateField?: (field: string) => string;
}

export function AuditTimeline<T extends TimelineLog>({
  logs,
  membersById,
  renderDiff,
  translateEvent,
  translateField,
}: AuditTimelineProps<T>) {
  const { t } = useTranslation('common');
  const [page, setPage] = useState(1);

  if (logs.length === 0) {
    return (
      <p className="text-[13px] text-slate-500 dark:text-slate-400 py-2">
        {t('no-logs-available')}
      </p>
    );
  }

  const sorted = [...logs].sort((a, b) => b.date - a.date);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const current = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-5">
        {current.map((log, idx) => {
          // Resolve actor name
          const actorName =
            (log.actor?.id ? membersById?.get(log.actor.id) : undefined) ??
            log.actor?.name ??
            t('unknown-user');

          // Event label
          const rawEvent = log.event;
          const eventLabel = translateEvent
            ? translateEvent(rawEvent)
            : rawEvent;

          // Field label
          const fieldLabel =
            log.diff?.field && translateField
              ? translateField(log.diff.field)
              : log.diff?.field;

          return (
            <li key={idx} className="relative pl-7">
              {/* Timeline dot */}
              <span
                className={cn(
                  'absolute -left-[9px] top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border',
                  eventDotCls(log.event)
                )}
              >
                <EventIcon event={log.event} />
              </span>

              {/* Entry */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                    {actorName}
                  </span>
                  <span className="text-[12px] text-slate-600 dark:text-slate-300">
                    {eventLabel.toLowerCase()}
                    {fieldLabel && (
                      <>
                        {' '}
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {fieldLabel}
                        </span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-auto">
                    {relativeTime(log.date)}
                  </span>
                </div>

                {/* Diff section */}
                {log.diff &&
                  (renderDiff ? (
                    renderDiff(log)
                  ) : (
                    <DefaultDiffChips
                      prevValue={log.diff.prevValue}
                      nextValue={log.diff.nextValue}
                    />
                  ))}

                {/* Absolute timestamp */}
                <p className="text-[11px] text-slate-400 mt-0.5">
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
}

export default AuditTimeline;
