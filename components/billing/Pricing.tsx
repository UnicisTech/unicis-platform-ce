import { useTranslation } from 'next-i18next';
import { SubscriptionStatus, Plan } from '@prisma/client';
import React from 'react';
import { TeamWithSubscription } from 'types';
import DaisyButton from '../shared/daisyUI/DaisyButton';

interface PricingProps {
  team: TeamWithSubscription;
  plans: any[];
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSubscription: React.Dispatch<React.SetStateAction<string>>;
}

const Pricing = ({
  team,
  plans,
  setSelectedSubscription,
  setVisible,
}: PricingProps) => {
  // const { team } = useTeam();
  const { t } = useTranslation('common');
  const currentStatus = team.subscription?.status;
  console.log('team', team);
  const currentPlan =
    currentStatus === SubscriptionStatus.ACTIVE
      ? team.subscription?.plan
      : Plan.COMMUNITY;
  // const initiateCheckout = async (price: string, quantity?: number) => {
  //   const res = await fetch(
  //     `/api/teams/${team?.slug}/payments/create-checkout-session`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ price, quantity }),
  //     }
  //   );

  //   const data = await res.json();

  //   if (data?.data?.url) {
  //     window.open(data.data.url, '_blank', 'noopener,noreferrer');
  //   } else {
  //     toast.error(
  //       data?.error?.message ||
  //       data?.error?.raw?.message ||
  //       t('stripe-checkout-fallback-error')
  //     );
  //   }
  // };

  // const hasActiveSubscription = (price: Price) =>
  //   subscriptions.some((s) => s.priceId === price.id);

  return (
    <section className="py-3 m-auto">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          return (
            <div
              className="relative rounded-md bg-white border border-gray-200"
              key={plan.id}
            >
              <div className="p-8">
                <div className="flex justify-center flex-col items-center space-x-2 pb-8">
                  <h3 className="font-display text-2xl font-bold text-black">
                    {plan.name}
                  </h3>
                  <p className="text-sm">Users: {plan.users}</p>
                </div>
                <div className="flex items-center flex-col justify-center space-x-2">
                  <h3 className="font-display text-2xl font-bold text-black">
                    {plan.price}
                  </h3>
                  <span>{plan.subprice}</span>
                </div>
              </div>
              <div className="flex justify-center flex-col gap-2 border-gray-200 px-8 h-10">
                {currentPlan === plan.id ? (
                  <DaisyButton
                    key={plan.id}
                    variant="outline"
                    size="md"
                    fullWidth
                    disabled
                    className="rounded-full"
                  >
                    {t('current')}
                  </DaisyButton>
                ) : (
                  <DaisyButton
                    key={plan.id}
                    variant="outline"
                    size="md"
                    fullWidth
                    disabled={team.subscription?.plan === plan.id}
                    className="rounded-full"
                    onClick={() => {
                      setSelectedSubscription(plan.id);
                      setVisible(true);
                    }}
                  >
                    {t('order')}
                  </DaisyButton>
                )}
              </div>
              <ul className="mb-10 mt-5 space-y-4 px-8">
                {plan.applications.map((application: string) => (
                  <li
                    className="flex space-x-4"
                    key={`${plan.id}-${application}`}
                  >
                    <svg
                      className="h-6 w-6 flex-none text-black"
                      viewBox="0 0 24 24"
                      width={24}
                      height={24}
                      fill="none"
                      shapeRendering="geometricPrecision"
                    >
                      <path
                        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                        fill="currentColor"
                      />
                      <path
                        d="M8 11.8571L10.5 14.3572L15.8572 9"
                        stroke="white"
                      />
                    </svg>
                    <p className="text-gray-600">{application}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Pricing;
