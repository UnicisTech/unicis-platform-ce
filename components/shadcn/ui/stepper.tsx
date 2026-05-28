import * as React from 'react';
import { cn } from '@/components/shadcn/lib/utils';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-x-1 sm:gap-x-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = isCompleted && !!onStepChange;

        return (
          <div
            key={index}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center text-center',
              isClickable && 'cursor-pointer group'
            )}
            onClick={isClickable ? () => onStepChange(index) : undefined}
          >
            {/* Dot or active indicator */}
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full mb-2 transition-colors',
                isActive && 'bg-blue-600',
                isCompleted && 'bg-blue-600/70',
                !isActive && !isCompleted && 'bg-muted-foreground',
                isClickable &&
                  'group-hover:bg-blue-500 group-hover:ring-2 group-hover:ring-blue-300'
              )}
            />

            {/* Title below */}
            <div
              className={cn(
                'w-full text-xs leading-tight break-words whitespace-normal [overflow-wrap:anywhere] transition-colors',
                isActive && 'text-blue-600 font-semibold',
                isCompleted && 'text-blue-600/70 font-medium',
                !isActive && !isCompleted && 'text-muted-foreground',
                isClickable &&
                  'group-hover:text-blue-500 underline decoration-dotted underline-offset-2'
              )}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
}
