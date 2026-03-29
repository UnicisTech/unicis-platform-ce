import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import ControlBlock from './ControlBlock';
import type { Task, Team } from '@/generated/browser';
import useCanAccess from 'hooks/useCanAccess';
import ControlBlockViewOnly from './ControlBlockViewOnly';
import { getCscControlsProp } from '@/lib/csc';
import type { ISO } from 'types';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';
import { Loading } from '@/components/shared';
import useISO from 'hooks/useISO';
import CscTabs from '../CscTabs';
import useCscStatuses from 'hooks/useCscStatuses';

// TODO: refactoring
const CscPanel = ({
  task,
  team,
  cscFrameworks,
  mutateTask,
}: {
  task: Task;
  team: Team;
  cscFrameworks: ISO[];
  mutateTask: () => Promise<void>;
}) => {
  const slug = team.slug;
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(slug);

  const [activeTab, setActiveTab] = useState<ISO>(cscFrameworks[0]);
  const { statuses, mutateStatuses } = useCscStatuses(slug, activeTab);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Draft controls per ISO tab (only local unsaved edits)
  const [draftByIso, setDraftByIso] = useState<Record<string, string[]>>({});

  const properties = task.properties as any;

  // Source of truth from server for current tab
  const serverControls = useMemo(() => {
    return (properties?.[getCscControlsProp(activeTab)] as string[]) ?? [];
  }, [properties, activeTab]);

  // What we render right now (draft overrides server)
  const controls = draftByIso[activeTab] ?? serverControls;

  const setControlsForActiveTab = useCallback(
    (updater: (prev: string[]) => string[]) => {
      setDraftByIso((prev) => {
        const current = prev[activeTab] ?? serverControls;
        return { ...prev, [activeTab]: updater(current) };
      });
    },
    [activeTab, serverControls]
  );

  const clearDraftForActiveTab = useCallback(() => {
    setDraftByIso((prev) => {
      const { ...rest } = prev;
      delete rest[activeTab];
      return rest;
    });
  }, [activeTab]);

  const addControl = useCallback(() => {
    setControlsForActiveTab((prev) => [...prev, '']);
  }, [setControlsForActiveTab]);

  const deleteControls = useCallback(async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/teams/${slug}/tasks/${task.taskNumber}/csc`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            controls,
            operation: 'remove',
            ISO: activeTab,
          }),
        }
      );

      const { error } = await res.json();
      if (!res.ok || error)
        return toast.error(error?.message || t('errors.requestFailed'));

      clearDraftForActiveTab();
      await mutateTask();
    } catch {
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setIsDeleting(false);
    }
  }, [
    slug,
    task.taskNumber,
    controls,
    activeTab,
    mutateTask,
    clearDraftForActiveTab,
  ]);

  const controlHanlder = useCallback(
    async (oldControl: string, newControl: string) => {
      // optimistic local update so UI does not flicker
      setControlsForActiveTab((prev) => {
        if (oldControl === '') {
          // replace one empty slot with newControl
          const idx = prev.findIndex((c) => c === '');
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = newControl;
          return next;
        }

        // replace oldControl with newControl (first match)
        const idx = prev.findIndex((c) => c === oldControl);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = newControl;
        return next;
      });

      setIsSaving(true);
      try {
        const body =
          oldControl === ''
            ? { controls: [newControl], operation: 'add', ISO: activeTab }
            : {
                controls: [oldControl, newControl],
                operation: 'change',
                ISO: activeTab,
              };

        const res = await fetch(
          `/api/teams/${slug}/tasks/${task.taskNumber}/csc`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );

        const { error } = await res.json();
        if (!res.ok || error) {
          toast.error(error?.message || t('errors.requestFailed'));
          // rollback by clearing draft and letting serverControls take over on next render
          clearDraftForActiveTab();
          return;
        }

        clearDraftForActiveTab();
        await mutateTask();
      } catch {
        toast.error(t('errors.somethingWentWrong'));
        clearDraftForActiveTab();
      } finally {
        setIsSaving(false);
      }
    },
    [
      slug,
      task.taskNumber,
      activeTab,
      mutateTask,
      setControlsForActiveTab,
      clearDraftForActiveTab,
    ]
  );

  const deleteControlHandler = useCallback(
    async (control: string) => {
      // optimistic local remove
      setControlsForActiveTab((prev) => prev.filter((c) => c !== control));

      setIsDeleting(true);
      try {
        const res = await fetch(
          `/api/teams/${slug}/tasks/${task.taskNumber}/csc`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              controls: [control],
              operation: 'remove',
              ISO: activeTab,
            }),
          }
        );

        const { error } = await res.json();
        if (!res.ok || error) {
          toast.error(error?.message || t('errors.requestFailed'));
          clearDraftForActiveTab();
          return;
        }

        clearDraftForActiveTab();
        await mutateTask();
      } catch {
        toast.error(t('errors.somethingWentWrong'));
        clearDraftForActiveTab();
      } finally {
        setIsDeleting(false);
      }
    },
    [
      slug,
      task.taskNumber,
      activeTab,
      mutateTask,
      setControlsForActiveTab,
      clearDraftForActiveTab,
    ]
  );

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      try {
        const response = await fetch(`/api/teams/${slug}/csc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ control, value, framework: activeTab }),
        });

        const { error } = await response.json();
        if (error) return toast.error(error.message);

        toast.success('Status changed!');
        mutateStatuses();
      } catch {
        toast.error(t('errors.somethingWentWrong'));
      }
    },
    [slug, activeTab, mutateStatuses]
  );

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold">{t('csc-controls')}</h2>

      <CscTabs
        frameworks={cscFrameworks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {canAccess('task', ['update']) ? (
        <>
          {controls.map((control, index) => (
            <ControlBlock
              key={`${control}-${index}`}
              ISO={activeTab}
              status={statuses[control]}
              control={control}
              controls={controls}
              onControlChange={controlHanlder}
              onStatusChange={statusHandler}
              onDeleteControl={deleteControlHandler}
              isSaving={isSaving}
              isDeleting={isDeleting}
            />
          ))}

          <div className="mt-[15px] flex justify-end">
            <div className="mx-[5px] my-0">
              <Button
                color="primary"
                size="sm"
                onClick={addControl}
                disabled={isDeleting || isSaving}
              >
                {(isDeleting || isSaving) && (
                  <Loader2 className="animate-spin" />
                )}
                {t('add-control')}
              </Button>
            </div>

            <div className="mx-[5px] my-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteControls}
                disabled={isDeleting || isSaving}
              >
                {t('remove')}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {controls.map((control, index) => (
            <ControlBlockViewOnly
              key={`${control}-${index}`}
              ISO={activeTab}
              status={statuses[control]}
              control={control}
            />
          ))}
        </>
      )}
    </div>
  );
};

const WithISO = ({
  team,
  task,
  mutateTask,
}: {
  team: Team;
  task: Task;
  mutateTask: () => Promise<void>;
}) => {
  const { ISO } = useISO(team);

  if (!ISO) return <Loading />;

  return (
    <CscPanel
      task={task}
      team={team}
      cscFrameworks={ISO}
      mutateTask={mutateTask}
    />
  );
};

export default WithISO;
