import Link from 'next/link';
import { Card } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import type { TeamWithSubscription, SubscriptionWithPayments } from 'types';
import useTeamMembers from 'hooks/useTeamMembers';
import { getTotalPrice, userPrice } from '@/lib/subscriptions';
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
  if (subscription.payments.length === 0) {
    return null
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
        <div className="flex flex-col gap-4">
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
            <span>€{userPrice}</span>
          </p>
          <p>
            <b>Total: </b>
            <span>€{getTotalPrice(subscription.plan, members.length)}</span>
          </p>
          <p>
            <b>Invoice Date: </b>
            <span>{format(new Date(newestPayment.date), 'MMMM d, yyyy')}</span>
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
      </Card.Body>
      {/* <AccessControl resource="team" actions={['update']}> */}
      <Card.Footer>
        <div className="flex justify-end">
          <Link
            rel="noopener noreferrer"
            target="_blank"
            style={newestPayment.paymentUrl ? {} : { pointerEvents: 'none' }}
            href={newestPayment.paymentUrl || ''}
          >
            <Button
              type="submit"
              color="primary"
              disabled={!newestPayment.paymentUrl}
              size="md"
            >
              {t('pay-now')}
            </Button>
          </Link>
        </div>
      </Card.Footer>
      {/* </AccessControl> */}
    </Card>
  );
};

export default WisePaymentCard;
