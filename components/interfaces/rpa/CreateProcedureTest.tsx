import RpaProcedureDialog from './procedure-form/RpaProcedureDialog';
import { CreatePiaRisk } from '@/components/interfaces/pia';
import { CreateProcedure as CreateTiaProcedure } from '@/components/interfaces/tia';
import { Task } from '@/generated/browser';
import {
  PiaRisk,
  RpaProcedureInterface,
  TaskProperties,
  TiaProcedureInterface,
  UseRpaCreationState,
} from 'types';

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
          prevProcedure={
            (selectedTask?.properties as TaskProperties)?.rpa_procedure as
              | RpaProcedureInterface
              | undefined
          }
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
          prevRisk={
            (selectedTask?.properties as TaskProperties)?.pia_risk as
              | PiaRisk
              | undefined
          }
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
          prevProcedure={
            (selectedTask?.properties as TaskProperties)?.tia_procedure as
              | TiaProcedureInterface
              | undefined
          }
          selectedTask={selectedTask}
          mutateTasks={mutateTasks}
          completeCallback={() => onProcedureCompletedCallback('TIA')}
        />
      )}
    </>
  );
};

export default CreateProcedureTest;
