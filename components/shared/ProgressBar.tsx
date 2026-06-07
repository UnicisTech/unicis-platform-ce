import React from 'react'
import { cn } from '@/components/shadcn/lib/utils'

function getColour(pct: number): string {
  if (pct >= 80) return 'bg-ub-green'
  if (pct >= 40) return 'bg-ub-amber'
  return 'bg-ub-red'
}

function getTextColour(pct: number): string {
  if (pct >= 80) return 'text-ub-green'
  if (pct >= 40) return 'text-ub-amber'
  return 'text-ub-red'
}

export interface ProgressBarProps {
  label?: string
  value: number
  showPercent?: boolean
  height?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({ label, value, showPercent = true, height = 'sm', className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-[11px] text-slate-500 truncate pr-2">{label}</span>}
          {showPercent && (
            <span className={cn('text-[11px] font-medium flex-shrink-0', getTextColour(pct))}>
              {pct}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn('w-full bg-slate-200 rounded-full overflow-hidden', height === 'sm' ? 'h-1' : 'h-1.5')}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${pct}%`}
      >
        <div
          className={cn('h-full rounded-full transition-all', getColour(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
