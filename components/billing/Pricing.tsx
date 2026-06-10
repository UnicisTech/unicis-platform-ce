import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { SubscriptionStatus, Plan } from '@/generated/browser';
import type { TeamWithSubscriptionDto } from 'types';
import { Button } from '@/components/shadcn/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/components/shadcn/lib/utils';

export type BillingPeriod = 'monthly' | 'annual';

interface PlanConfig {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  users: string;
  subprice: string;
  applications: string[];
  features: string[];
  featuresLabel?: string;
  recommended?: boolean;
}

interface PricingProps {
  team: TeamWithSubscriptionDto;
  plans: PlanConfig[];
  onPlanSelect: (planId: string, billingPeriod: BillingPeriod) => void;
}

const formatMonthlyPrice = (base: number, period: BillingPeriod): string => {
  if (base === 0) return 'Free';
  if (period === 'monthly') return `€${base}/mo`;
  const discounted = Math.round(base * 80) / 100;
  return `€${discounted.toFixed(2)}/mo`;
};

const formatAnnualTotal = (base: number): string => {
  const total = Math.round(base * 80 * 12) / 100;
  return `€${total.toFixed(2)}/yr`;
};

const Pricing: React.FC<PricingProps> = ({ team, plans, onPlanSelect }) => {
  const { t } = useTranslation('common');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const currentStatus = team.subscription?.status;
  const currentPlan =
    currentStatus === SubscriptionStatus.ACTIVE
      ? team.subscription!.plan
      : Plan.COMMUNITY;

  return (
    <section className="py-4">
      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('billing.section-title')}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {t('billing.section-subtitle')}
        </p>
      </div>

      {/* Billing period toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              billingPeriod === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
            onClick={() => setBillingPeriod('monthly')}
          >
            {t('billing.monthly')}
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              billingPeriod === 'annual'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
            onClick={() => setBillingPeriod('annual')}
          >
            {t('billing.annual')}
            <span className="rounded-full bg-ub-green-bg border border-ub-green-border px-1.5 py-0.5 text-[10px] font-semibold text-ub-green-text leading-none">
              {t('billing.save-20')}
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isRecommended = !!plan.recommended;
          const displayPrice = formatMonthlyPrice(
            plan.basePrice,
            billingPeriod
          );
          const showAnnualNote =
            plan.basePrice > 0 && billingPeriod === 'annual';

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-xl bg-white dark:bg-slate-800 transition-shadow',
                isRecommended
                  ? 'border-2 border-ub-blue shadow-lg'
                  : 'border border-slate-200 dark:border-slate-700 shadow-sm'
              )}
            >
              {/* Most Popular badge */}
              {isRecommended && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ub-blue px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    {t('billing.most-popular')}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className={cn('px-6 pb-4', isRecommended ? 'pt-9' : 'pt-6')}>
                {isCurrent && (
                  <span className="mb-2 inline-block rounded-full bg-ub-green-bg border border-ub-green-border px-2.5 py-0.5 text-[11px] font-semibold text-ub-green-text">
                    {t('billing.current-plan-badge')}
                  </span>
                )}

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {plan.name}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400 min-h-[36px] leading-snug">
                  {plan.description}
                </p>

                {/* Price block */}
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {displayPrice}
                  </span>
                </div>
                {showAnnualNote && (
                  <p className="mt-0.5 text-xs font-medium text-ub-green-text">
                    {formatAnnualTotal(plan.basePrice)}{' '}
                    {t('billing.billed-annually')}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {plan.subprice}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t('users')}: {plan.users}
                </p>
              </div>

              {/* CTA button */}
              <div className="px-6 pb-5">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t('billing.current-plan-badge')}
                  </Button>
                ) : isRecommended ? (
                  <Button
                    className="w-full bg-ub-blue hover:bg-ub-blue-hover text-white"
                    onClick={() => onPlanSelect(plan.id, billingPeriod)}
                  >
                    {t('order')} {plan.name}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onPlanSelect(plan.id, billingPeriod)}
                  >
                    {t('order')}
                  </Button>
                )}
              </div>

              <hr className="mx-6 border-slate-100 dark:border-slate-700" />

              {/* Feature list */}
              <div className="flex-1 px-6 pt-4 pb-6 space-y-4">
                {plan.applications.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t('billing.modules-label')}
                    </p>
                    <ul className="space-y-2.5">
                      {plan.applications.map((app) => (
                        <li key={app} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-ub-green"
                            aria-hidden
                          />
                          <span className="text-[13px] leading-snug text-slate-600 dark:text-slate-300">
                            {app}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.features.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {plan.featuresLabel
                        ? plan.featuresLabel
                        : t('billing.features-label')}
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-ub-blue"
                            aria-hidden
                          />
                          <span className="text-[13px] leading-snug text-slate-600 dark:text-slate-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nudge */}
      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        {t('billing.premium-nudge')}
      </p>
    </section>
  );
};

export default Pricing;
