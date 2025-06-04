'use client';

import { Fragment } from 'react';
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

  // Convert headers into steps with optional descriptions (none used here)
  // const steps = headers.map((title) => (title));

  const Wrapper = theme === 'dark' ? 'div' : Fragment;

  return (
    <Wrapper className={theme === 'dark' ? 'text-white' : ''}>
      <Stepper
        steps={headers}
        currentStep={currentStage}
        onStepChange={() => {}}
      />
    </Wrapper>
  );
};

export default StageTracker;
