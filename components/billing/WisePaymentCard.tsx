import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';
import { useTranslation } from 'next-i18next';
import { Plan } from '@prisma/client';
import { addDays } from 'date-fns';
import { format } from 'date-fns/format';
import type { TeamWithSubscription, SubscriptionWithPayments } from 'types';
import useTeamMembers from 'hooks/useTeamMembers';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/shadcn/ui/card';

interface WisePaymentCardProps {
  team: TeamWithSubscription;
}

// NOTE: duplicates subscriptions.ts as a hotfix (as in original)
const planPrice: Record<Plan, number> = {
  [Plan.COMMUNITY]: 0,
  [Plan.PREMIUM]: 49,
  [Plan.ULTIMATE]: 89,
};

const eur = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const getTotalPrice = (plan: Plan, amount: number) => planPrice[plan] * amount;

export default function WisePaymentCard({ team }: WisePaymentCardProps) {
  const { t } = useTranslation('common');
  const subscription = team.subscription as SubscriptionWithPayments | null;
  const { members, isError, isLoading } = useTeamMembers(team.slug);

  if (isLoading || isError || !members || !subscription) return null;
  if (!subscription.payments?.length) return null;

  // Find newest payment safely
  const newestPayment = subscription.payments.reduce((latest, payment) =>
    payment.date > latest.date ? payment : latest
  );

  const totalPrice = getTotalPrice(subscription.plan, members.length);
  const paymentUrl = `https://wise.com/pay/business/unicistechou?currency=EUR&amount=${totalPrice}`;

  const invoiceDate = new Date(newestPayment.date);
  const nextInvoiceDate = addDays(invoiceDate, 30);

  return (
    <Card className="w-full">
      <CardHeader className="gap-1">
        <CardTitle>{t('wise-payment')}</CardTitle>
        <CardDescription>{t('wise-payment-details')}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm">
              <b className="font-semibold">Team: </b>
              <span>{team.name}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">Number of Members: </b>
              <span>{members.length}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">Price per user: </b>
              <span>{eur.format(planPrice[subscription.plan])}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">Total: </b>
              <span>{eur.format(totalPrice)}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">Invoice Date: </b>
              <span>{format(invoiceDate, 'MMMM d, yyyy')}</span>
            </p>
            <p className="text-sm">
              <b className="font-semibold">Next invoice Date: </b>
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
              alt="Wise Quick Pay QR Code"
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
