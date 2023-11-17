import React, {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import ControlBlock from './ControlBlock';
import type { Task } from '@prisma/client';
import { IssuePanelContainer } from 'sharedStyles';
import useCanAccess from 'hooks/useCanAccess';
import ControlBlockViewOnly from './ControlBlockViewOnly';
import { getCscControlsProp } from '@/lib/csc';
import type { ISO } from 'types';

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
    SetStateAction<{
      [key: string]: string;
    }>
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

  console.log('statuses', statuses);

  useEffect(() => {
    setControls(issueControls);
  }, [issueControls]);

  const addControl = useCallback(() => {
    setControls((prev) => [...prev, '']);
  }, [setControls]);

  const deleteControls = useCallback(async () => {
    setIsDeleting(true);

    const response = await axios.put(
      `/api/teams/${slug}/tasks/${task.taskNumber}/csc`,
      {
        controls: [...controls],
        operation: 'remove',
        ISO,
      }
    );

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      setIsDeleting(false);
      return;
    }

    mutateTask();
    setIsDeleting(false);
  }, [task, mutateTask, setIsDeleting]);

  const controlHanlder = useCallback(
    async (oldControl: string, newControl: string) => {
      setIsSaving(true);

      let response;

      if (oldControl === '') {
        response = await axios.put(
          `/api/teams/${slug}/tasks/${task.taskNumber}/csc`,
          {
            controls: [newControl],
            operation: 'add',
            ISO,
          }
        );
      } else {
        response = await axios.put(
          `/api/teams/${slug}/tasks/${task.taskNumber}/csc`,
          {
            controls: [oldControl, newControl],
            operation: 'change',
            ISO,
          }
        );
      }

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }

      mutateTask();
      setIsSaving(false);
    },
    [task, mutateTask, setIsSaving]
  );

  const deleteControlHandler = useCallback(
    async (control: string) => {
      setIsDeleting(true);

      const response = await axios.put(
        `/api/teams/${slug}/tasks/${task.taskNumber}/csc`,
        {
          controls: [control],
          operation: 'remove',
          ISO,
        }
      );

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        setIsDeleting(false);
        return;
      }

      mutateTask();

      setIsDeleting(false);
    },
    [task, mutateTask, setIsDeleting]
  );

  return (
    <IssuePanelContainer>
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
                variant="outline"
                size="sm"
                onClick={addControl}
                active={isDeleting || isSaving}
              >
                + Add Control
              </Button>
            </div>
            <div style={{ margin: '0 5px' }}>
              <Button variant="outline" size="sm" onClick={deleteControls}>
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
    </IssuePanelContainer>
  );
};

export default CscPanel;
