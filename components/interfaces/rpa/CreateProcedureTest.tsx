import RpaProcedureDialog from './procedure-form/RpaProcedureDialog';
import { CreatePiaRisk } from '@/components/interfaces/pia';
import { CreateProcedure as CreateTiaProcedure } from '@/components/interfaces/tia';
import type { Task } from 'types';
import { UseRpaCreationState } from 'types';
import { getPiaRisk, getRpaProcedure, getTiaProcedure } from '@/lib/properties';

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
        <RpaProcedureDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          prevProcedure={getRpaProcedure(selectedTask?.properties)}
          tasks={tasks}
          selectedTask={selectedTask}
          mutateTasks={mutateTasks}
          completeCallback={onRpaCompletedCallback}
        />
      )}
      {isPiaOpen && (
        <CreatePiaRisk
          key={selectedTask?.id || 'create-pia'}
          open={isPiaOpen}
          onOpenChange={setIsPiaOpen}
          prevRisk={getPiaRisk(selectedTask?.properties)}
          selectedTask={selectedTask}
          mutateTasks={mutateTasks}
          completeCallback={() => onProcedureCompletedCallback('PIA')}
        />
      )}
      {isTiaOpen && (
        <CreateTiaProcedure
          key={selectedTask?.id || 'create-tia'}
          open={isTiaOpen}
          onOpenChange={setIsTiaOpen}
          prevProcedure={getTiaProcedure(selectedTask?.properties)}
          selectedTask={selectedTask}
          mutateTasks={mutateTasks}
          completeCallback={() => onProcedureCompletedCallback('TIA')}
        />
      )}
    </>
  );
};

export default CreateProcedureTest;
