import useTheme from 'hooks/useTheme';
import { Stepper } from '@/components/shadcn/ui/stepper';

const StageTracker = ({
  currentStage,
  headers,
}: {
  currentStage: number; 
  headers: string[];
}) => {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'text-white' : ''}>
      <Stepper
        steps={headers}
        currentStep={currentStage}
        onStepChange={() => {}}
      />
    </div>
  );
};

export default StageTracker;
