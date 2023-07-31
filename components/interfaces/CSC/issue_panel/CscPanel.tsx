import React, { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react'
import toast from "react-hot-toast";
import axios from "axios";
import { LoadingButton } from "@atlaskit/button";
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import ControlBlock from './ControlBlock'
import type { Task } from "@prisma/client";
import { IssuePanelContainer } from 'sharedStyles';

const CscPanel = ({
  task,
  statuses,
  setStatuses,
  mutateTask
}: {
  task: Task;
  statuses: { [key: string]: string; };
  setStatuses: Dispatch<SetStateAction<{
    [key: string]: string;
  }>>
  mutateTask: () => Promise<void>;
}) => {
  const { t } = useTranslation('common');

  const properties = task?.properties as any
  const issueControls = properties?.csc_controls as string[] || ['']

  const [controls, setControls] = useState(issueControls)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setControls(issueControls)
  }, [issueControls])

  const addControl = useCallback(() => {
    setControls(prev => [...prev, ''])
  }, [setControls])

  const deleteControls = useCallback(async () => {
    setIsDeleting(true)

    const response = await axios.put(
      `/api/tasks/${task.id}/csc`,
      {
        controls: [...controls],
        operation: 'remove'
      }
    );

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      setIsDeleting(false)
      return;
    }

    mutateTask()
    setIsDeleting(false)
  }, [task, mutateTask, setIsDeleting])

  const controlHanlder = useCallback(async (oldControl: string, newControl: string) => {
    setIsSaving(true)

    let response;

    if (oldControl === '') {
      response = await axios.put(
        `/api/tasks/${task.id}/csc`,
        {
          controls: [newControl],
          operation: 'add'
        }
      );
    } else {
      response = await axios.put(
        `/api/tasks/${task.id}/csc`,
        {
          controls: [oldControl, newControl],
          operation: 'change'
        }
      );
    }

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      setIsSaving(false)
      return;
    }

    mutateTask()
    setIsSaving(false)
  }, [task, mutateTask, setIsSaving])

  const deleteControlHandler = useCallback(async (control: string) => {
    setIsDeleting(true)

    const response = await axios.put(
      `/api/tasks/${task.id}/csc`,
      {
        controls: [control],
        operation: 'remove'
      }
    );

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      setIsDeleting(false)
      return;
    }

    mutateTask()

    setIsDeleting(false)
  }, [task, mutateTask, setIsDeleting])

  return (
    <IssuePanelContainer>
      <h2 className="text-1xl font-bold">Cybersecurity Controls</h2>
      {controls.map((control, index) => (
        <ControlBlock
          key={index}
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
      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
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
          <Button
            variant="outline"
            size="sm"
            onClick={deleteControls}
          >
            {t('remove')}
          </Button>
          {/* <Button
            color="error"
            size="sm"
            onClick={deleteControls}
            active={isDeleting}
          >
            Delete
          </Button> */}
        </div>
      </div>
    </IssuePanelContainer>
  )
}

export default CscPanel