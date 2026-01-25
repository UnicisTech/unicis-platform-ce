import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DetailsModal, Pricing, WisePaymentCard } from '@/components/billing';
import { Plan } from '@prisma/client';
import { isAllowed } from 'models/user';
import { NextPageWithLayout } from 'types';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { getTeamAccess } from '@/lib/teams';

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

const Billing: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  teamFeatures,
  error,
}) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const [visible, setVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState('');

  if (isLoading) {
    return <Loading />;
  }

  if (isError || error) {
    return <Error message={isError?.message || error?.message} />;
  }

  if (!team) {
    return <Error message={t('errors.teamNotFound')} />;
  }

  return (
    <>
      <TeamTab activeTab="billing" team={team} teamFeatures={teamFeatures} />
      <Pricing
        plans={plans}
        team={team}
        onPlanSelect={(planId) => {
          setSelectedSubscription(planId);
          setVisible(true);
        }}
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const access = await getTeamAccess(req, res, query);

  if (!access) {
    return {
      notFound: true,
    };
  }

  const { teamMember, teamFeatures } = access;
  const baseProps = {
    ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    teamFeatures,
  };

  if (!isAllowed(teamMember.role, 'team_audit_log', 'read')) {
    return {
      props: {
        ...baseProps,
        error: {
          message: 'You are not allowed to perform read on team_audit_log',
        },
      },
    };
  }

  return {
    props: {
      ...baseProps,
      error: null,
    },
  };
}

export default Billing;
