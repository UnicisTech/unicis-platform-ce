import { ProgressTracker, type Stages } from '@atlaskit/progress-tracker';
import styled from 'styled-components';
import useTheme from 'hooks/useTheme';
import { Fragment } from 'react';

const StageTrackerWrapper = styled.div`
  div[style*="color: var(--ds-text"] a {
    color: var(--ds-text-subtlest, #626F86) !important;
  }
  div[style*="color: var(--ds-text-subtlest"] {
    color: white !important;
  }
`;

const StageTracker = ({ currentStage, headers }: { currentStage: number, headers: string[] }) => {
  const { theme } = useTheme();
  
  const Wrapper = theme === 'dark' ? StageTrackerWrapper : Fragment

  const items: Stages = Array(headers.length).fill(null).map((_, index) => ({
    id: `step-${index + 1}`,
    label: headers[index],
    percentageComplete: index < currentStage ? 100 : 0,
    status: index < currentStage ? 'visited' : index === currentStage ? 'current' : 'unvisited',
    href: '#',
  }));

  return (
    <Wrapper>
      <ProgressTracker items={items} spacing="compact" />
    </Wrapper>
  );
};

export default StageTracker;
