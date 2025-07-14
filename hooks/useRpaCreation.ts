import { Task } from '@prisma/client';
import { useEffect, useState } from 'react';
import type { ProcedureQueueItem, UseRpaCreationState } from 'types';

const useRpaCreation = (task?: Task): UseRpaCreationState => {
  const [isRpaOpen, setIsRpaOpen] = useState<boolean>(false);
  const [isPiaOpen, setIsPiaOpen] = useState<boolean>(false);
  const [isTiaOpen, setIsTiaOpen] = useState<boolean>(false);

  const [selectedTask, setSelectedTask] = useState<Task | undefined>(task);
  const [procedureQueue, setProcedureQueue] = useState<ProcedureQueueItem[]>(
    []
  );

  const onRpaCompletedCallback = (
    procedureQueue: ProcedureQueueItem[],
    selectedTask: Task
  ) => {
    setProcedureQueue(procedureQueue);
    setSelectedTask(selectedTask);
  };

  const onProcedureCompletedCallback = (procedure: ProcedureQueueItem) => {
    setProcedureQueue((prev) => prev.filter((item) => item !== procedure));
  };

  const openHandlers = {
    PIA: setIsPiaOpen,
    TIA: setIsTiaOpen,
  };

  useEffect(() => {
    if (procedureQueue.length) {
      const nextProcedure = procedureQueue[0];
      const nextProcedureOpenHandler = openHandlers[nextProcedure];
      setTimeout(() => {
        nextProcedureOpenHandler(true);
      }, 1000);
    }
  }, [procedureQueue]);

  useEffect(() => {
    if (task) {
      setSelectedTask(task);
    }
  }, [task]);

  return {
    selectedTask,
    isRpaOpen,
    isPiaOpen,
    isTiaOpen,
    setIsRpaOpen,
    setIsPiaOpen,
    setIsTiaOpen,
    onRpaCompletedCallback,
    onProcedureCompletedCallback,
  };
};

export default useRpaCreation;
