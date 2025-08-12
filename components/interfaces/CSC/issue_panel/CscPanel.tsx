import React, {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import ControlBlock from './ControlBlock';
import type { Task } from '@prisma/client';
import useCanAccess from 'hooks/useCanAccess';
import ControlBlockViewOnly from './ControlBlockViewOnly';
import { getCscControlsProp } from '@/lib/csc';
import type { ISO } from 'types';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

const CscPanel = ({
  task,
  statuses,
  ISO,
  setStatuses,
  mutateTask,
}: {
  task: Task;
  statuses: { [key: string]: string };
  ISO: ISO;
  setStatuses: Dispatch<
    SetStateAction<
      | {
          [key: string]: string;
        }
      | undefined
    >
  >;
  mutateTask: () => Promise<void>;
}) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();

  const router = useRouter();
  const { slug } = router.query;

  const properties = task?.properties as any;
  const issueControls = (properties?.[getCscControlsProp(ISO)] as string[]) || [
    '',
  ];

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
      const res = await fetch(`/api/teams/${slug}/tasks/${task.taskNumber}/csc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controls, operation: 'remove', ISO }),
      });

      const { error } = await res.json();
      if (!res.ok || error) return toast.error(error?.message || 'Request failed');

      mutateTask();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  }, [slug, task, controls, ISO, mutateTask]);

  const controlHanlder = useCallback(
    async (oldControl: string, newControl: string) => {
      setIsSaving(true);
      try {
        const body =
          oldControl === ''
            ? { controls: [newControl], operation: 'add', ISO }
            : { controls: [oldControl, newControl], operation: 'change', ISO };

        const res = await fetch(`/api/teams/${slug}/tasks/${task.taskNumber}/csc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const { error } = await res.json();
        if (!res.ok || error) return toast.error(error?.message || 'Request failed');

        mutateTask();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setIsSaving(false);
      }
    },
    [slug, task, ISO, mutateTask]
  );

  const deleteControlHandler = useCallback(async (control: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/teams/${slug}/tasks/${task.taskNumber}/csc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controls: [control], operation: 'remove', ISO }),
      });

      const { error } = await res.json();
      if (!res.ok || error) return toast.error(error?.message || 'Request failed');

      mutateTask();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  }, [slug, task, ISO, mutateTask]);


  return (
    <div className="p-5">
      <h2 className="text-1xl font-bold">Cybersecurity Controls</h2>
      {canAccess('task', ['update']) ? (
        <>
          {controls.map((control, index) => (
            <ControlBlock
              key={index}
              ISO={ISO}
              status={statuses[control]}
              setStatuses={setStatuses}
              control={control}
              controls={controls}
              controlHanlder={controlHanlder}
              deleteControlHandler={deleteControlHandler}
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
                {(isDeleting || isSaving) && <Loader2 className='animate-spin'/>}
                + Add Control
              </Button>
            </div>
            <div style={{ margin: '0 5px' }}>
              <Button variant="destructive" size="sm" onClick={deleteControls} disabled={isDeleting || isSaving}>
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
              ISO={ISO}
              status={statuses[control]}
              control={control}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CscPanel;
