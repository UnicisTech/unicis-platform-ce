import * as React from 'react';
import { cn } from '@/components/shadcn/lib/utils';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <div className="flex w-full min-w-0 items-start">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = !!onStepChange;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            {/* Step */}
            <div
              className={cn(
                'flex min-w-0 flex-col items-center text-center',
                isClickable && 'cursor-pointer group'
              )}
              onClick={isClickable ? () => onStepChange(index) : undefined}
              style={{ flex: '0 0 auto', maxWidth: '6rem' }}
            >
              {/* Dot */}
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full mb-1.5 transition-all shrink-0',
                  isActive && 'bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-800/50',
                  isCompleted && 'bg-blue-500',
                  !isActive && !isCompleted && 'bg-slate-300 dark:bg-slate-600',
                  isClickable &&
                    'group-hover:bg-blue-400 dark:group-hover:bg-blue-500 group-hover:ring-2 group-hover:ring-blue-200 dark:group-hover:ring-blue-800/50'
                )}
              />

              {/* Label */}
              <div
                className={cn(
                  'text-[10px] leading-tight break-words whitespace-normal [overflow-wrap:anywhere] transition-colors px-0.5',
                  isActive && 'text-blue-600 dark:text-blue-400 font-semibold',
                  isCompleted && 'text-blue-500 font-medium',
                  !isActive && !isCompleted && 'text-slate-400',
                  isClickable && 'group-hover:text-blue-500'
                )}
              >
                {step}
              </div>
            </div>

            {/* Connector line between steps */}
            {!isLast && (
              <div className="flex-1 flex items-start pt-[5px] mx-1 min-w-0">
                <div
                  className={cn(
                    'h-[2px] w-full rounded-full transition-colors',
                    isCompleted ? 'bg-blue-400 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
