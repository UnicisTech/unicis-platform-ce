import React, { useState, useCallback, useEffect } from 'react'
import toast from "react-hot-toast";
import axios from "axios";
import Button, { LoadingButton } from "@atlaskit/button";
import ControlBlock from './ControlBlock'
import type { Task } from "@prisma/client";

const IssuePanel = ({
  task,
  mutateTask
}: {
  task: Task,
  mutateTask: () => Promise<void>
}) => {
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
  }, [task, mutateTask ,setIsDeleting])

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
    <div style={{ backgroundColor: 'white', padding: '10px 20px' }}>
      {controls.map((control, index) => (
        <ControlBlock
          key={index}
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
          <LoadingButton
            appearance="primary"
            onClick={addControl}
            isDisabled={isDeleting || isSaving}
            isLoading={isSaving}
          >
            {isSaving ? 'Saving' : '+ Add Control'}
          </LoadingButton>
        </div>
        <div style={{ margin: '0 5px' }}>
          <LoadingButton
            appearance="danger"
            onClick={deleteControls}
            isLoading={isDeleting}
          >
            Delete
          </LoadingButton>
        </div>
      </div>
    </div>

  )
}

export default IssuePanel