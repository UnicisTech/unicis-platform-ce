import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import ControlBlock from './ControlBlock';
import type { Task, Team } from '@prisma/client';
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

const CscPanel2 = ({
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
  const { canAccess } = useCanAccess();
  const [activeTab, setActiveTab] = useState<ISO>(cscFrameworks[0]);
  const { statuses, mutateStatuses } = useCscStatuses(slug, activeTab);

  const properties = task.properties as any;
  const issueControls = useMemo(() => {
    return (properties?.[getCscControlsProp(activeTab)] as string[]) || [''];
  }, [properties, activeTab, task]);

  const [controls, setControls] = useState(issueControls);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setControls(issueControls);
  }, [issueControls]);

  const addControl = useCallback(() => {
    setControls((prev) => [...prev, '']);
  }, [setControls]);

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
        return toast.error(error?.message || 'Request failed');

      mutateTask();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  }, [slug, task, controls, activeTab, mutateTask]);

  const controlHanlder = useCallback(
    async (oldControl: string, newControl: string) => {
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
        if (!res.ok || error)
          return toast.error(error?.message || 'Request failed');

        mutateTask();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setIsSaving(false);
      }
    },
    [slug, task, activeTab, mutateTask]
  );

  const deleteControlHandler = useCallback(
    async (control: string) => {
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
        if (!res.ok || error)
          return toast.error(error?.message || 'Request failed');

        mutateTask();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setIsDeleting(false);
      }
    },
    [slug, task, activeTab, mutateTask]
  );

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      try {
        const response = await fetch(`/api/teams/${slug}/csc`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ control, value, framework: activeTab }),
        });

        const { error } = await response.json();

        if (error) {
          return toast.error(error.message);
        }

        toast.success('Status changed!');
        mutateStatuses();
      } catch (err) {
        toast.error('Something went wrong');
      }
    },
    [slug, activeTab]
  );

  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold">{t('csc-controls')}</h2>

      <CscTabs
        iso={cscFrameworks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {canAccess('task', ['update']) ? (
        <>
          {controls.map((control, index) => (
            <ControlBlock
              key={index}
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
          <div
            style={{
              marginTop: '15px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ margin: '0 5px' }}>
              <Button
                color="primary"
                size="sm"
                onClick={addControl}
                disabled={isDeleting || isSaving}
              >
                {(isDeleting || isSaving) && (
                  <Loader2 className="animate-spin" />
                )}
                + Add Control
              </Button>
            </div>
            <div style={{ margin: '0 5px' }}>
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
              key={index}
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

  if (!ISO) {
    return <Loading />;
  }

  return (
    <CscPanel2
      task={task}
      team={team}
      cscFrameworks={ISO}
      mutateTask={mutateTask}
    />
  );
};

export default WithISO;
