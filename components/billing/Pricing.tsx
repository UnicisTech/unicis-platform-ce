import React from 'react';
import { useTranslation } from 'next-i18next';
import { SubscriptionStatus, Plan } from '@prisma/client';
import type { TeamWithSubscription } from 'types';
import { Button } from '@/components/shadcn/ui/button';
import { Check } from 'lucide-react';

interface PricingProps {
  team: TeamWithSubscription;
  plans: any[];
  onPlanSelect: (planId: string) => void;
}

const Pricing: React.FC<PricingProps> = ({ team, plans, onPlanSelect }) => {
  const { t } = useTranslation('common');
  const currentStatus = team.subscription?.status;
  const currentPlan =
    currentStatus === SubscriptionStatus.ACTIVE
      ? team.subscription!.plan
      : Plan.COMMUNITY;

  return (
    <section className="py-3 m-auto">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="relative rounded-md bg-background border border-border"
          >
            <div className="p-8">
              <div className="flex flex-col items-center pb-8 space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('users')}: {plan.users}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {plan.price}
                </h3>
                <span className="text-muted-foreground">{plan.subprice}</span>
              </div>
            </div>

            <div className="flex items-center justify-center px-8 h-10">
              {currentPlan === plan.id ? (
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  disabled
                >
                  {t('current')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => {
                    onPlanSelect(plan.id);
                  }}
                  disabled={team.subscription?.plan === plan.id}
                >
                  {t('order')}
                </Button>
              )}
            </div>

            <ul className="mb-10 mt-5 space-y-4 px-8">
              {plan.applications.map((app) => (
                <li
                  key={`${plan.id}-${app}`}
                  className="flex items-center space-x-4"
                >
                  <Check className="h-6 w-6 flex-none text-foreground" />
                  <p className="text-muted-foreground">{app}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
