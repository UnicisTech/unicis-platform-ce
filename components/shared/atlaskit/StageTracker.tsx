import useTheme from 'hooks/useTheme';
import { Stepper } from '@/components/shadcn/ui/stepper';

const StageTracker = ({
  currentStage,
  headers,
  onStepChange,
}: {
  currentStage: number;
  headers: string[];
  onStepChange?: (step: number) => void;
}) => {
  const { theme } = useTheme();

  return (
    <div className={`w-full min-w-0 ${theme === 'dark' ? 'text-white' : ''}`}>
      <Stepper
        steps={headers}
        currentStep={currentStage}
        onStepChange={onStepChange}
      />
    </div>
  );
};

export default StageTracker;
