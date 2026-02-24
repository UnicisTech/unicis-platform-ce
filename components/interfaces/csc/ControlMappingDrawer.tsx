import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task } from '@prisma/client';
import type { ISO } from 'types';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import {
  getFrameworkMappings,
  getMappingCount,
} from '@/lib/csc/framework-mapping-utils';
import '@/lib/csc/framework-mappings';
import { getCscControlsProp } from '@/lib/csc';
import frameworks from '@/lib/csc/frameworks';

interface ControlMappingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  controlId: string;
  controlCode: string;
  controlTitle: string;
  currentFramework: ISO;
  enabledFrameworks: ISO[];
  tasks: Task[];
  onLinkTask: (
    taskNumber: number,
    controlId: string,
    iso: ISO
  ) => Promise<void>;
}

const RELATIONSHIP_BADGE: Record<string, string> = {
  equivalent: 'badge-success',
  implements: 'badge-info',
  subset: 'badge-warning',
  superset: 'badge-secondary',
  related: 'badge-neutral',
};

const FRAMEWORK_BADGE: Partial<Record<ISO, string>> = {
  '2013': 'badge-primary',
  '2022': 'badge-primary',
  mvps: 'badge-success',
  nistcsfv2: 'badge-error',
  eunis2: 'badge-warning',
  gdpr: 'badge-info',
  cisv81: 'badge-secondary',
  soc2v2: 'badge-accent',
  c5_2020: 'badge-neutral',
};

const TASK_STATUS_BADGE: Record<string, string> = {
  done: 'badge-success',
  inProgress: 'badge-info',
  backlog: 'badge-neutral',
  todo: 'badge-ghost',
};

export default function ControlMappingDrawer({
  isOpen,
  onClose,
  controlId,
  controlCode,
  controlTitle,
  currentFramework,
  enabledFrameworks,
  tasks,
  onLinkTask,
}: ControlMappingDrawerProps) {
  const { t } = useTranslation('common');

  const mappingEntry = getFrameworkMappings(controlId);
  const otherFrameworks = enabledFrameworks.filter(
    (f) => f !== currentFramework
  );

  const cscControlsProp = getCscControlsProp(currentFramework);
  const linkedTasks = (tasks as any[]).filter((task) =>
    (task.properties?.[cscControlsProp] as string[] | undefined)?.includes(
      controlId
    )
  );
  const unlinkedTasks = (tasks as any[]).filter(
    (task) =>
      !(task.properties?.[cscControlsProp] as string[] | undefined)?.includes(
        controlId
      )
  );

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const relationship = mappingEntry?.relationship;
  const relBadge = relationship ? RELATIONSHIP_BADGE[relationship] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from the right */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-base-100 shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={t('csc-mapping.drawer.aria-label', 'Framework Mapping')}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-base-300 bg-base-200/60">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`badge badge-sm font-mono font-bold ${FRAMEWORK_BADGE[currentFramework] ?? 'badge-primary'}`}
              >
                {controlCode}
              </span>
              {relBadge && relationship && (
                <span className={`badge badge-sm ${relBadge}`}>
                  {t(`csc-mapping.relationship.${relationship}`, relationship)}
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-base-content leading-snug line-clamp-2">
              {controlTitle}
            </h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              {isoValueToLabel(currentFramework)} ·{' '}
              {t('csc-mapping.drawer.subtitle', 'Cross-Framework Mappings')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
            aria-label={t('close', 'Close')}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto divide-y divide-base-200">

          {/* SECTION 1 — Framework mappings */}
          <section className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">
              {t('csc-mapping.drawer.mappings-title', 'Mapped Controls')}
            </h3>

            {!mappingEntry || otherFrameworks.length === 0 ? (
              <div className="text-center py-8 text-base-content/40">
                <svg
                  className="w-10 h-10 mx-auto mb-2 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                <p className="text-sm font-medium">
                  {t('csc-mapping.drawer.no-mappings', 'No mappings available')}
                </p>
                <p className="text-xs mt-1">
                  {t(
                    'csc-mapping.drawer.no-mappings-hint',
                    'Enable more frameworks in Settings → Cybersecurity Settings'
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {otherFrameworks.map((fw) => {
                  const mapped = mappingEntry.mappings[fw];
                  if (!mapped || mapped.length === 0) {
                    return (
                      <div
                        key={fw}
                        className="rounded-lg border border-base-200 overflow-hidden opacity-50"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-base-200/30">
                          <span
                            className={`badge badge-sm font-semibold ${FRAMEWORK_BADGE[fw] ?? 'badge-neutral'}`}
                          >
                            {isoValueToLabel(fw)}
                          </span>
                          <span className="text-xs text-base-content/40 italic">
                            {t(
                              'csc-mapping.drawer.no-mapping-for-framework',
                              'No mapping'
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={fw}
                      className="rounded-lg border border-base-200 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 bg-base-200/40">
                        <span
                          className={`badge badge-sm font-semibold ${FRAMEWORK_BADGE[fw] ?? 'badge-neutral'}`}
                        >
                          {isoValueToLabel(fw)}
                        </span>
                        <span className="text-xs text-base-content/50">
                          {mapped.length}{' '}
                          {t(
                            'csc-mapping.drawer.controls-count',
                            'control(s)'
                          )}
                        </span>
                      </div>
                      <div className="divide-y divide-base-200">
                        {mapped.map((mappedId) => {
                          const fwControls = frameworks[fw]?.controls ?? [];
                          const controlMeta = fwControls.find(
                            (c) => c.id === mappedId
                          );
                          const sectionId = controlMeta?.sectionId;

                          const code = t(
                            `csc/${fw}:controls.${mappedId}.code`,
                            mappedId
                          );
                          const controlName = t(
                            `csc/${fw}:controls.${mappedId}.control`,
                            ''
                          );
                          const requirements = t(
                            `csc/${fw}:controls.${mappedId}.requirements`,
                            ''
                          );
                          const sectionLabel = sectionId
                            ? t(
                                `csc/${fw}:sections.${sectionId}.label`,
                                sectionId
                              )
                            : '';

                          return (
                            <div
                              key={mappedId}
                              className="px-3 py-2.5 hover:bg-base-200/20 transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <span
                                  className={`badge badge-xs font-mono flex-shrink-0 mt-0.5 ${FRAMEWORK_BADGE[fw] ?? 'badge-neutral'}`}
                                >
                                  {code}
                                </span>
                                <div className="min-w-0 flex-1">
                                  {sectionLabel && (
                                    <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-semibold leading-none mb-0.5">
                                      {sectionLabel}
                                    </p>
                                  )}
                                  {controlName && (
                                    <p className="text-xs font-semibold text-base-content leading-snug">
                                      {code !== mappedId
                                        ? `${controlName}`
                                        : controlName}
                                    </p>
                                  )}
                                  {requirements && (
                                    <p className="text-xs text-base-content/60 mt-0.5 leading-snug">
                                      {requirements}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 2 — Linked tasks */}
          <section className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">
              {t('csc-mapping.drawer.linked-tasks', 'Linked Tasks')} (
              {linkedTasks.length})
            </h3>

            {linkedTasks.length === 0 ? (
              <p className="text-sm text-base-content/40 text-center py-4">
                {t(
                  'csc-mapping.drawer.no-linked-tasks',
                  'No tasks linked to this control yet.'
                )}
              </p>
            ) : (
              <div className="space-y-2">
                {linkedTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-base-200/40 border border-base-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-base-content/40">
                          #{task.taskNumber}
                        </span>
                        <span className="text-xs font-medium text-base-content truncate">
                          {task.title}
                        </span>
                      </div>
                      {task.status && (
                        <span className="text-[10px] text-base-content/40 mt-0.5 block capitalize">
                          {task.status}
                        </span>
                      )}
                    </div>
                    <span
                      className={`badge badge-sm ${TASK_STATUS_BADGE[task.status] ?? 'badge-ghost'}`}
                    >
                      {task.status ?? 'open'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Link unlinked tasks */}
            {unlinkedTasks.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-base-content/50 mb-2">
                  {t(
                    'csc-mapping.drawer.link-task-label',
                    'Link an existing task to this control:'
                  )}
                </p>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {unlinkedTasks.map((task: any) => (
                    <button
                      key={task.id}
                      onClick={() =>
                        onLinkTask(task.taskNumber, controlId, currentFramework)
                      }
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-base-200 hover:border-primary hover:bg-primary/5 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-base-content/40 group-hover:text-primary flex-shrink-0">
                          #{task.taskNumber}
                        </span>
                        <span className="text-xs text-base-content truncate">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {t('csc-mapping.drawer.link-btn', 'Link')} →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-base-300 bg-base-200/30">
          <p className="text-[11px] text-base-content/40 text-center">
            {t(
              'csc-mapping.drawer.footer-hint',
              'Mappings are based on enabled frameworks in Cybersecurity Settings.'
            )}
          </p>
        </div>
      </div>
    </>
  );
}
