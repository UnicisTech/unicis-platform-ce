import React from 'react'
import { X, Filter } from 'lucide-react'
import { useTranslation } from 'next-i18next'

export interface FilterChip {
  label: string
  value: string
  onRemove: () => void
  colour?: 'blue' | 'amber' | 'red'
}

export interface FilterChipRowProps {
  chips: FilterChip[]
  onClearAll: () => void
}

const chipColour = {
  blue:  'bg-ub-blue-bg border-ub-blue-border text-ub-blue-text',
  amber: 'bg-ub-amber-bg border-ub-amber-border text-ub-amber-text',
  red:   'bg-ub-red-bg border-ub-red-border text-ub-red-text',
}

export function FilterChipRow({ chips, onClearAll }: FilterChipRowProps) {
  const { t } = useTranslation('common')
  if (chips.length === 0) return null
  return (
    <div className="flex items-center gap-1.5 flex-wrap py-1.5 px-4 bg-white border-b border-slate-200">
      <span className="text-[11px] text-slate-500">{t('filtered-by')}:</span>
      {chips.map((chip) => (
        <span
          key={chip.value}
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${chipColour[chip.colour ?? 'blue']}`}
        >
          <Filter size={10} aria-hidden />
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 opacity-60 hover:opacity-100"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-[11px] text-slate-500 hover:text-slate-600 ml-1"
      >
        {t('clear-all')}
      </button>
    </div>
  )
}
