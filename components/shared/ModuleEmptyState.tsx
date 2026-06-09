import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/shadcn/ui/button'

// Accepts any React icon component (Lucide, Heroicons, etc.) OR a public image path
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconProp = React.ComponentType<any> | string

export interface ModuleEmptyStateProps {
  icon: IconProp
  title: string
  description: string
  regulatoryContext: string
  ctaLabel?: string
  onCta?: () => void
  docsHref?: string
}

export function ModuleEmptyState({
  icon,
  title,
  description,
  regulatoryContext,
  ctaLabel,
  onCta,
  docsHref,
}: ModuleEmptyStateProps) {
  const iconNode =
    typeof icon === 'string' ? (
      <Image
        src={icon}
        alt=""
        width={22}
        height={22}
        style={{ width: '22px', height: 'auto' }}
      />
    ) : (
      React.createElement(icon, {
        className: 'text-ub-blue w-[22px] h-[22px]',
        'aria-hidden': true,
      })
    )

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-xl bg-ub-blue-bg border border-ub-blue-border flex items-center justify-center mb-4">
        {iconNode}
      </div>
      <h3 className="text-[15px] font-medium text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{description}</p>
      <span className="text-[11px] font-medium text-ub-blue-text bg-ub-blue-bg border border-ub-blue-border px-2.5 py-1 rounded-md mb-5">
        {regulatoryContext}
      </span>
      {onCta && ctaLabel && (
        <Button onClick={onCta} size="sm" className="mb-3">
          {ctaLabel}
        </Button>
      )}
      {docsHref && (
        <a
          href={docsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-ub-blue hover:underline"
        >
          Learn more in documentation →
        </a>
      )}
    </div>
  )
}
