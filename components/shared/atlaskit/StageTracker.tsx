import { ProgressTracker, type Stages } from '@atlaskit/progress-tracker';

const StageTracker = ({ currentStage, headers }: { currentStage: number, headers: string[] }) => {
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