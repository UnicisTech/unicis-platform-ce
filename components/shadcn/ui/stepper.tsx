import * as React from 'react';
import { cn } from '@/components/shadcn/lib/utils';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-x-1 sm:gap-x-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep;

        return (
          <div
            key={index}
            className="flex min-w-0 flex-1 flex-col items-center text-center"
          >
            {/* Dot or active indicator */}
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full mb-2',
                isActive ? 'bg-blue-600' : 'bg-muted-foreground'
              )}
            />

            {/* Title below */}
            <div
              className={cn(
                'w-full text-xs leading-tight break-words whitespace-normal [overflow-wrap:anywhere]',
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {step}
            </div>

            {/* Bottom active bar */}
            {/* {isActive && (
              <div className="h-1 w-10 mt-1 bg-blue-600 rounded-full" />
            )} */}
          </div>
        );
      })}
    </div>
  );
}
