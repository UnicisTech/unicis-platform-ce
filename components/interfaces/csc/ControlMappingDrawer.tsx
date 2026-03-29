import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import type { ISO, Task } from 'types';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import { getFrameworkMappings } from '@/lib/csc/framework-mapping-utils';
import '@/lib/csc/framework-mappings';
import { getCscControlsProp } from '@/lib/csc';
import frameworks from '@/lib/csc/frameworks';
import { cn } from '@/components/shadcn/lib/utils';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/shadcn/ui/drawer';

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

const RELATIONSHIP_BADGE: Record<string, 'default' | 'secondary' | 'outline'> =
  {
    equivalent: 'default',
    implements: 'secondary',
    subset: 'outline',
    superset: 'secondary',
    related: 'outline',
  };

const TASK_STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  done: 'default',
  inProgress: 'secondary',
  backlog: 'outline',
  todo: 'outline',
  failed: 'outline',
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
  const getStatusLabel = (status?: string) => {
    if (!status) return t('status-unknown', 'Unknown');
    const key = status.toLowerCase();
    return t(`task-statuses.${key}`, status);
  };

  const mappingEntry = getFrameworkMappings(controlId);
  const otherFrameworks = enabledFrameworks.filter(
    (f) => f !== currentFramework
  );

  const cscControlsProp = getCscControlsProp(currentFramework);
  const linkedTasks = tasks.filter((task) =>
    (task.properties?.[cscControlsProp] as string[] | undefined)?.includes(
      controlId
    )
  );
  const unlinkedTasks = tasks.filter(
    (task) =>
      !(task.properties?.[cscControlsProp] as string[] | undefined)?.includes(
        controlId
      )
  );

  const relationship = mappingEntry?.relationship;
  const relBadge = relationship ? RELATIONSHIP_BADGE[relationship] : null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        className="right-0 left-auto top-0 bottom-0 mt-0 h-full w-full max-w-lg rounded-none border-l bg-background [&>div:first-child]:hidden sm:rounded-l-lg"
        aria-label={t('csc-mapping.drawer.aria-label', 'Framework Mapping')}
      >
        <DrawerHeader className="flex flex-row items-start justify-between gap-3 border-b text-left">
          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge className="font-mono font-bold" variant="secondary">
                {controlCode}
              </Badge>
              {relBadge && relationship && (
                <Badge variant={relBadge}>
                  {t(`csc-mapping.relationship.${relationship}`, relationship)}
                </Badge>
              )}
            </div>
            <DrawerTitle className="text-sm leading-snug line-clamp-2">
              {controlTitle}
            </DrawerTitle>
            {(() => {
              const req = t(
                `csc/${currentFramework}:controls.${controlId}.requirements`,
                ''
              );
              return req ? (
                <DrawerDescription className="text-xs mt-1 leading-snug">
                  {req}
                </DrawerDescription>
              ) : null;
            })()}
            <p className="text-xs text-muted-foreground mt-1">
              {isoValueToLabel(currentFramework)} ·{' '}
              {t('csc-mapping.drawer.subtitle', 'Cross-Framework Mappings')}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={t('close', 'Close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto divide-y">
          <section className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('csc-mapping.drawer.mappings-title', 'Mapped Controls')}
            </h3>

            {!mappingEntry || otherFrameworks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground/70">
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
                        className="rounded-lg border overflow-hidden opacity-60"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
                          <Badge variant="outline">{isoValueToLabel(fw)}</Badge>
                          <span className="text-xs text-muted-foreground italic">
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
                    <div key={fw} className="rounded-lg border overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/40">
                        <Badge variant="secondary">{isoValueToLabel(fw)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {mapped.length}{' '}
                          {t('csc-mapping.drawer.controls-count', 'control(s)')}
                        </span>
                      </div>
                      <div className="divide-y">
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
                              className="px-3 py-2.5 hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <Badge
                                  variant="outline"
                                  className="font-mono flex-shrink-0 mt-0.5"
                                >
                                  {code}
                                </Badge>
                                <div className="min-w-0 flex-1">
                                  {sectionLabel && (
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none mb-0.5">
                                      {sectionLabel}
                                    </p>
                                  )}
                                  {controlName && (
                                    <p className="text-xs font-semibold leading-snug">
                                      {code !== mappedId
                                        ? `${controlName}`
                                        : controlName}
                                    </p>
                                  )}
                                  {requirements && (
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
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

          <section className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('csc-mapping.drawer.linked-tasks', 'Linked Tasks')} (
              {linkedTasks.length})
            </h3>

            {linkedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t(
                  'csc-mapping.drawer.no-linked-tasks',
                  'No tasks linked to this control yet.'
                )}
              </p>
            ) : (
              <div className="space-y-2">
                {linkedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{task.taskNumber}
                        </span>
                        <span className="text-xs font-medium truncate">
                          {task.title}
                        </span>
                      </div>
                      {task.status && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 block capitalize">
                          {getStatusLabel(task.status)}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={TASK_STATUS_BADGE[task.status] ?? 'outline'}
                    >
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {unlinkedTasks.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
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
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors text-left group',
                        'hover:border-foreground/30 hover:bg-muted/60'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground flex-shrink-0">
                          #{task.taskNumber}
                        </span>
                        <span className="text-xs truncate group-hover:text-foreground">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-xs text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {t('csc-mapping.drawer.link-btn', 'Link')} →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="px-4 py-3 border-t bg-muted/30">
          <p className="text-[11px] text-muted-foreground text-center">
            {t(
              'csc-mapping.drawer.footer-hint',
              'Mappings are based on enabled frameworks in Cybersecurity Settings.'
            )}
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
