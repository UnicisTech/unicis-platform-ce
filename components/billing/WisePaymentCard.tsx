import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';
import { useTranslation } from 'next-i18next';
import type {
  SubscriptionWithPaymentsDto,
  TeamWithSubscriptionDto,
} from 'types';
import useTeamMembers from 'hooks/useTeamMembers';
import { format, addMonths } from 'date-fns';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/shadcn/ui/card';
import { Plan } from '@/generated/browser';

interface WisePaymentCardProps {
  team: TeamWithSubscriptionDto;
}

const formatEUR = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(
    n ?? 0
  );

const monthlyPlanPrice = {
  [Plan.COMMUNITY]: 0,
  [Plan.PREMIUM]: 19,
  [Plan.ULTIMATE]: 49,
};

const getPricePerUser = (plan: Plan, isAnnual: boolean): number => {
  const base = monthlyPlanPrice[plan];
  return isAnnual ? Math.round(base * 80) / 100 : base;
};

const getTotalPrice = (plan: Plan, members: number, isAnnual: boolean): number => {
  const perUser = getPricePerUser(plan, isAnnual);
  return isAnnual ? perUser * 12 * members : perUser * members;
};

export default function WisePaymentCard({ team }: WisePaymentCardProps) {
  const { t } = useTranslation('common');
  const subscription = team.subscription as SubscriptionWithPaymentsDto | null;
  const { members, isError, isLoading } = useTeamMembers(team.slug);

  if (isLoading || isError || !members || !subscription) return null;
  if (!subscription.payments?.length) return null;

  const isAnnual = subscription.isAnnual ?? false;

  const newestPayment =
    subscription.payments.reduce((latest, payment) =>
      new Date(payment.date) > new Date(latest.date) ? payment : latest
    ) ?? subscription.payments[0];

  const newestDate = new Date(newestPayment.date);
  const nextInvoiceDate = addMonths(newestDate, isAnnual ? 12 : 1);

  const pricePerUser = getPricePerUser(subscription.plan, isAnnual);
  const totalPrice = getTotalPrice(subscription.plan, members.length, isAnnual);
  const paymentUrl = `https://wise.com/pay/business/unicistechou?currency=EUR&amount=${totalPrice}`;

  return (
    <Card className="w-full">
      <CardHeader className="gap-1">
        <CardTitle className="flex items-center gap-2">
          {t('wise-payment')}
          {isAnnual && (
            <span className="rounded-full bg-ub-green-bg border border-ub-green-border px-2 py-0.5 text-[11px] font-semibold text-ub-green-text">
              {t('billing.annual')}
            </span>
          )}
        </CardTitle>
        <CardDescription>{t('wise-payment-details')}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm">
              <b className="font-semibold">{t('team')}: </b>
              <span>{team.name}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">{t('number-of-members')}: </b>
              <span>{members.length}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">{t('price-per-user')}: </b>
              <span>
                {formatEUR(pricePerUser)}/mo
                {isAnnual && (
                  <span className="ml-1 text-xs text-ub-green-text font-medium">
                    ({t('billing.save-20')})
                  </span>
                )}
              </span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">{t('total')}: </b>
              <span>
                {formatEUR(totalPrice)}
                {isAnnual ? '/yr' : '/mo'}
              </span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">{t('invoice-date')}: </b>
              <span>{format(newestDate, 'MMMM d, yyyy')}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">{t('next-invoice-date')}: </b>
              <span>{format(nextInvoiceDate, 'MMMM d, yyyy')}</span>
            </p>

            <Link href={paymentUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src="/pww-button.svg"
                alt="Pay with WISE"
                width={170}
                height={44}
                className="h-auto w-auto"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center justify-end">
            <Image
              src="/wise-quick-pay-qr-code-2.png"
              alt={t('pay-with-wise')}
              width={260}
              height={260}
              className="h-auto max-w-full"
              priority
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
