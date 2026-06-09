import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/components/shadcn/lib/utils'

// ── Sparkline ────────────────────────────────────────────────────────────────

interface SparklineProps {
  values: number[]  // 2–12 values, oldest first, 0–100
  colour?: string   // Tailwind text colour class
}

function Sparkline({ values, colour = 'text-ub-green' }: SparklineProps) {
  if (values.length < 2) return null
  const w = 60, h = 16, pad = 2
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')

  return (
    <svg width={w} height={h} aria-hidden className={colour}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  )
}

// ── KpiCard ──────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  subColour?: 'green' | 'red' | 'amber' | 'muted'
  icon: LucideIcon
  sparkline?: number[]  // 6 values, oldest first, 0–100
  sparklineColour?: string
  onClick?: () => void
}

const subColourMap: Record<string, string> = {
  green: 'text-ub-green',
  red:   'text-ub-red',
  amber: 'text-ub-amber',
  muted: 'text-slate-400',
}

export function KpiCard({
  label,
  value,
  sub,
  subColour = 'muted',
  icon: Icon,
  sparkline,
  sparklineColour,
  onClick,
}: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      className={cn(
        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 select-none',
        onClick && 'cursor-pointer hover:border-ub-blue-border hover:shadow-sm transition-all'
      )}
    >
      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1.5">
        <Icon size={12} aria-hidden />
        {label}
      </div>
      <div className="text-xl font-medium leading-none text-slate-900 dark:text-slate-100">{value}</div>
      {sparkline && sparkline.length >= 2 && (
        <div className="mt-1.5 mb-0.5">
          <Sparkline values={sparkline} colour={sparklineColour} />
        </div>
      )}
      {sub && (
        <div className={cn('text-[10px] mt-1', subColourMap[subColour] ?? 'text-slate-400')}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── KpiStrip container ───────────────────────────────────────────────────────

export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3.5">
      {children}
    </div>
  )
}
