import { ProgressTracker, type Stages } from '@atlaskit/progress-tracker';
import { headers } from '@/components/defaultLanding/data/configs/rpa';

const StageTracker = ({ currentStage }: { currentStage: number }) => {
  const items: Stages = Array(6).fill(null).map((_, index) => ({
    id: `step-${index + 1}`,
    label: headers[index],
    percentageComplete: index < currentStage ? 100 : 0,
    status: index < currentStage ? 'visited' : index === currentStage ? 'current' : 'unvisited',
    href: '#',
  }));

  return <ProgressTracker items={items} spacing="compact" />;
};

export default StageTracker;