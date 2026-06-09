import React from 'react'
import { Lock } from 'lucide-react'
import { useTranslation } from 'next-i18next'

export interface UpgradeGateProps {
  featureName: string
  description: string
  requiredPlan?: 'Premium' | 'Ultimate'
  onUpgrade?: () => void
}

export function UpgradeGate({
  featureName,
  description,
  requiredPlan = 'Premium',
  onUpgrade,
}: UpgradeGateProps) {
  const { t } = useTranslation('common')

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-ub-purple-bg border-b border-ub-purple-border text-[11px] font-medium text-ub-purple-text">
        <Lock size={12} aria-hidden />
        {t('upgrade-gate.plan-feature', { plan: requiredPlan })}
      </div>
      <div className="flex items-center justify-between gap-3 px-3 py-3 bg-white dark:bg-slate-800">
        <div>
          <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 mb-0.5">{featureName}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
        <button
          onClick={onUpgrade}
          className="btn btn-primary btn-sm text-[12px] flex-shrink-0"
        >
          {t('upgrade-gate.upgrade-plan')}
        </button>
      </div>
    </div>
  )
}
