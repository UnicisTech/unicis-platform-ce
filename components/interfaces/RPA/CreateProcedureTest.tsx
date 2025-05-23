import { CreateProcedure as CreateRpaProcedure } from '@/components/interfaces/RPA';
import { CreatePiaRisk } from '@/components/interfaces/PIA';
import { CreateProcedure as CreateTiaProcedure } from '@/components/interfaces/TIA';
import { Task } from '@prisma/client';
import { UseRpaCreationState } from 'types';

interface CreateProcedureTestProps extends UseRpaCreationState {
  tasks?: Task[];
  mutateTasks: () => Promise<void>;
}

const CreateProcedureTest = ({
  selectedTask,
  isRpaOpen: isCreateOpen,
  isPiaOpen,
  isTiaOpen,
  setIsRpaOpen: setIsCreateOpen,
  setIsPiaOpen,
  setIsTiaOpen,
  onRpaCompletedCallback,
  onProcedureCompletedCallback,
  tasks,
  mutateTasks,
}: CreateProcedureTestProps) => {
  return (
    <>
      {isCreateOpen && (
        <CreateRpaProcedure
          visible={isCreateOpen}
          setVisible={setIsCreateOpen}
          tasks={tasks}
          selectedTask={selectedTask}
          mutateTasks={mutateTasks}
          completeCallback={onRpaCompletedCallback}
        />
      )}
      {isPiaOpen && (
        <CreatePiaRisk
          key={selectedTask?.id || 'create-pia'}
          visible={isPiaOpen}
          setVisible={setIsPiaOpen}
          selectedTask={selectedTask || undefined}
          mutateTasks={mutateTasks}
          completeCallback={() => onProcedureCompletedCallback('PIA')}
        />
      )}
      {isTiaOpen && (
        <CreateTiaProcedure
          key={selectedTask?.id || 'create-tia'}
          visible={isTiaOpen}
          setVisible={setIsTiaOpen}
          selectedTask={selectedTask as Task}
          mutate={mutateTasks}
          completeCallback={() => onProcedureCompletedCallback('TIA')}
        />
      )}
    </>
  );
};

export default CreateProcedureTest;
