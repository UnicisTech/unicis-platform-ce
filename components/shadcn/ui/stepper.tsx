import * as React from 'react';
import { cn } from '@/components/shadcn/lib/utils';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  const progressPct = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <>
      {/* ── Mobile compact: progress bar + "Step N of M · Label" ── */}
      <div className="sm:hidden w-full space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 leading-tight">
            {steps[currentStep]}
          </span>
          <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
            {currentStep + 1}&thinsp;/&thinsp;{steps.length}
          </span>
        </div>
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Desktop full stepper ── */}
      <div className="hidden sm:flex w-full min-w-0 items-start">
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
    </>
  );
}
