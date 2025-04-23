import Link from 'next/link';
import { Card } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import React from 'react';
import type { TeamWithSubscription, SubscriptionWithPayments } from 'types';
import useTeamMembers from 'hooks/useTeamMembers';
import { getTotalPrice, planPrice } from '@/lib/subscriptions';
import { format } from 'date-fns/format';

interface WisePaymentCardProps {
  team: TeamWithSubscription;
}

const WisePaymentCard = ({ team }: WisePaymentCardProps) => {
  const { t } = useTranslation('common');
  const subscription = team.subscription as SubscriptionWithPayments;
  const { members, isError, isLoading } = useTeamMembers(team.slug);

  if (isLoading || isError || !members || !subscription) {
    return null;
  }

  const totalPrice = getTotalPrice(subscription.plan, members.length);
  const paymentUrl = `https://wise.com/pay/business/unicistechou?currency=EUR&amount=${totalPrice}`;

  if (subscription.payments.length === 0) {
    return null;
  }

  const newestPayment = subscription.payments.reduce((latest, payment) => {
    return payment.date > latest.date ? payment : latest;
  });

  console.log('newestPayment.paymentUrl', newestPayment.paymentUrl);

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('wise-payment')}</Card.Title>
          <Card.Description>{t('wise-payment-details')}</Card.Description>
        </Card.Header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex-1">
            <p>
              <b>Team: </b>
              <span>{team.name}</span>
            </p>
            <p>
              <b>Number of Members: </b>
              <span>{members.length || ''}</span>
            </p>
            <p>
              <b>Price per user: </b>
              <span>€{planPrice[subscription.plan]}</span>
            </p>
            <p>
              <b>Total: </b>
              <span>€{getTotalPrice(subscription.plan, members.length)}</span>
            </p>
            <p>
              <b>Invoice Date: </b>
              <span>
                {format(new Date(newestPayment.date), 'MMMM d, yyyy')}
              </span>
            </p>
            <p>
              <b>Next invoice Date: </b>
              <span>
                {format(
                  new Date(newestPayment.date).setDate(
                    new Date(newestPayment.date).getDate() + 30
                  ),
                  'MMMM d, yyyy'
                )}
              </span>
            </p>
          </div>
          <div className="flex-2 flex justify-end items-center">
            <img
              src="/wise-quick-pay-qr-code-2.png"
              alt="Wise Quick Pay QR Code"
              className="max-w-full h-auto"
              data-tip="Scan this QR code to make a quick payment with Wise"
            />
          </div>
        </div>
      </Card.Body>
      <Card.Footer>
        <div className="flex justify-end">
          <Link rel="noopener noreferrer" target="_blank" href={paymentUrl}>
            <img src="/pww-button.svg" alt="Pay with WISE" />
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default WisePaymentCard;
