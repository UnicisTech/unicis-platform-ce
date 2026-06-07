import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/components/shadcn/lib/utils'

export interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  subColour?: 'green' | 'red' | 'amber' | 'muted'
  icon: LucideIcon
  onClick?: () => void
}

const subColourMap = {
  green:  'text-ub-green',
  red:    'text-ub-red',
  amber:  'text-ub-amber',
  muted:  'text-slate-400',
}

export function KpiCard({ label, value, sub, subColour = 'muted', icon: Icon, onClick }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-slate-200 rounded-xl p-3',
        onClick && 'cursor-pointer hover:border-ub-blue-border transition-colors'
      )}
    >
      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1.5">
        <Icon size={12} aria-hidden />
        {label}
      </div>
      <div className="text-xl font-medium leading-none">{value}</div>
      {sub && (
        <div className={cn('text-[10px] mt-1', subColourMap[subColour])}>{sub}</div>
      )}
    </div>
  )
}

export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3.5">
      {children}
    </div>
  )
}
