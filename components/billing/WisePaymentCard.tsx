import Link from 'next/link';
import { Card } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import React from 'react';
import type { TeamWithSubscription, SubscriptionWithPayments } from 'types';
import useTeamMembers from 'hooks/useTeamMembers';
import { getTotalPrice, planPrice } from '@/lib/subscriptions';
import { format, addMonths } from 'date-fns';

interface WisePaymentCardProps {
  team: TeamWithSubscription;
}

const formatEUR = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(
    n ?? 0
  );

const WisePaymentCard = ({ team }: WisePaymentCardProps) => {
  const { t } = useTranslation('common');
  const subscription = team.subscription as
    | SubscriptionWithPayments
    | undefined;
  const { members, isError, isLoading } = useTeamMembers(team.slug);

  if (isLoading || isError || !members || !subscription) return null;
  if (!subscription.payments?.length) return null;

  const totalPrice = getTotalPrice(subscription.plan, members.length);
  const paymentUrl = `https://wise.com/pay/business/unicistechou?currency=EUR&amount=${totalPrice}`;

  const newestPayment =
    subscription.payments.reduce((latest, payment) =>
      new Date(payment.date) > new Date(latest.date) ? payment : latest
    ) ?? subscription.payments[0];

  const newestDate = new Date(newestPayment.date);
  const nextInvoiceDate = addMonths(newestDate, 1);

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('wise-payment')}</Card.Title>
          <Card.Description>{t('wise-payment-details')}</Card.Description>
        </Card.Header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex-1 space-y-1">
            <p>
              <b>{t('team')}: </b>
              <span>{team.name}</span>
            </p>
            <p>
              <b>{t('number-of-members')}: </b>
              <span>{members.length}</span>
            </p>
            <p>
              <b>{t('price-per-user')}: </b>
              <span>{formatEUR(planPrice[subscription.plan])}</span>
            </p>
            <p>
              <b>{t('total')}: </b>
              <span>{formatEUR(totalPrice)}</span>
            </p>
            <p>
              <b>{t('invoice-date')}: </b>
              <span>{format(newestDate, 'MMMM d, yyyy')}</span>
            </p>
            <p>
              <b>{t('next-invoice-date')}: </b>
              <span>{format(nextInvoiceDate, 'MMMM d, yyyy')}</span>
            </p>
          </div>

          <div className="flex-2 flex justify-end items-center">
            <img
              src="/wise-quick-pay-qr-code-2.png"
              alt={t('wise-qr-alt')}
              className="max-w-full h-auto"
              data-tip={t('scan-qr-tip')}
            />
          </div>
        </div>
      </Card.Body>

      <Card.Footer>
        <div className="flex justify-end">
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={paymentUrl}
            aria-label={t('pay-with-wise')}
          >
            <img src="/pww-button.svg" alt={t('pay-with-wise')} />
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default WisePaymentCard;
