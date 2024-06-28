import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import { TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DetailsModal, Pricing, WisePaymentCard } from '@/components/billing';
import { Plan } from '@prisma/client';

const plans = [
  {
    id: Plan.COMMUNITY,
    name: 'Community',
    users: '1 - 10',
    price: 'Free',
    subprice: 'unlimited',
    applications: [
      'Record of Processing Activities',
      'Transfer Impact Assessment',
      'Cybersecurity Controls: MVSP',
    ],
    features: ['SSO & SAML', 'Community Support'],
  },
  {
    id: Plan.PREMIUM,
    name: 'Premium',
    users: '11 - 150',
    price: '€49/mo',
    subprice: 'per tenant and up to 5 admins',
    applications: [
      'Interactive Awareness Program',
      'Privacy Impact Assessment',
      'Cybersecurity Controls: MVSP + ISO27001',
      'Cybersecurity Risk Management',
    ],
    featuresLabel: 'From Community',
    features: ['Webhooks & API'],
  },
  {
    id: Plan.ULTIMATE,
    name: 'Ultimate',
    users: '150 -',
    price: '€89/mo',
    subprice: 'per tenant and > 6 admins',
    applications: [
      'Processor Questionnaire Checklist',
      'Cybersecurity Controls + NIST CSF2.0 standard',
      'Asset Inventory Management',
      'Benchmark Report',
      'Vendor Assessment Checklist',
      'Vendor Report',
    ],
    featuresLabel: 'From Premium',
    features: ['Audit Logs'],
  },
];

const Billing = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const [visible, setVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState('');

  console.log('team billing', team);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <TeamTab activeTab="billing" team={team} teamFeatures={teamFeatures} />
      <Pricing
        plans={plans}
        setVisible={setVisible}
        team={team}
        setSelectedSubscription={setSelectedSubscription}
      />
      <DetailsModal
        visible={visible}
        setVisible={setVisible}
        team={team}
        selectedSubscription={selectedSubscription}
      />
      {team.subscription && <WisePaymentCard team={team} />}
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default Billing;
