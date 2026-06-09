import React from 'react'
import { CheckSquare, ChevronDown } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { CscStatusBadge, CSC_STATUS_TO_BADGE_KEY } from './CscStatusBadge'
import { CSC_STATUSES } from '@/lib/csc/csc-statuses'

export interface BulkActionBarProps {
  selectedCount: number
  step: 'link-tasks' | 'change-status'
  onLinkTasks: () => void
  onStatusChange: (status: string) => Promise<void>
  onClear: () => void
  statusDropdownOpen?: boolean
  onToggleStatusDropdown?: () => void
  hasAllTasksAssigned?: boolean
  showTaskLinkingStep?: boolean
}

export function BulkActionBar({
  selectedCount,
  step,
  onLinkTasks,
  onStatusChange,
  onClear,
  statusDropdownOpen = false,
  onToggleStatusDropdown,
  hasAllTasksAssigned = false,
  showTaskLinkingStep = true
}: BulkActionBarProps) {
  const { t } = useTranslation('common')
  const [isApplying, setIsApplying] = React.useState(false)

  const handleStatusSelect = async (status: string) => {
    setIsApplying(true)
    try {
      await onStatusChange(status)
    } finally {
      setIsApplying(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-4 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg">
        <CheckSquare size={15} aria-hidden />
        <span className="text-[13px] font-medium">{selectedCount} selected</span>
        <div className="w-px h-4 bg-slate-600" />

        {step === 'link-tasks' && showTaskLinkingStep && (
          <>
            <button
              onClick={onLinkTasks}
              className="text-[12px] font-medium bg-ub-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              {t('bulk-actions.link-tasks-required')}
            </button>
            <span className="text-[11px] text-slate-400">
              {t('bulk-actions.step-1-link-tasks')}
            </span>
          </>
        )}

        {step === 'change-status' && (
          <>
            <div className="relative">
              <button
                onClick={onToggleStatusDropdown}
                disabled={!hasAllTasksAssigned}
                className="text-[12px] font-medium bg-ub-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {t('bulk-actions.change-status')} <ChevronDown size={12} />
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              {!hasAllTasksAssigned
                ? `⚠️ ${t('bulk-actions.all-controls-must-have-tasks')}`
                : showTaskLinkingStep
                  ? t('bulk-actions.step-2-change-status')
                  : t('bulk-actions.change-status')}
            </span>
          </>
        )}

        <button
          onClick={onClear}
          className="text-[12px] text-slate-400 hover:text-white ml-1"
        >
          Clear
        </button>
      </div>

      {/* Status dropdown — shown in step 2 when open */}
      {step === 'change-status' && statusDropdownOpen && hasAllTasksAssigned && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg min-w-[280px]">
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {isApplying ? 'Applying...' : t('bulk-actions.select-new-status')}
          </div>
          {CSC_STATUSES.filter(s => s !== 'unknown').map((statusEnum) => {
            // Convert hyphenated enum to underscored for CscStatusBadge (not-performed → not_performed)
            const badgeStatus = (statusEnum.replace(/-/g, '_') as any);
            return (
              <button
                key={statusEnum}
                onClick={() => handleStatusSelect(statusEnum)}
                disabled={isApplying}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <CscStatusBadge
                  status={badgeStatus}
                  size="sm"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {t(`statuses.${statusEnum}.label`)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  )
}
