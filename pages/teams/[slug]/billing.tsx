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
    nameKey: 'billing.plans.community.name',
    usersKey: 'billing.plans.community.users',
    priceKey: 'billing.plans.community.price',
    subpriceKey: 'billing.plans.community.subprice',
    applicationsKeys: [
      'billing.plans.community.applications.0',
      'billing.plans.community.applications.1',
      'billing.plans.community.applications.2',
    ],
    featuresKeys: [
      'billing.plans.community.features.0',
      'billing.plans.community.features.1',
    ],
  },
  {
    id: Plan.PREMIUM,
    nameKey: 'billing.plans.premium.name',
    usersKey: 'billing.plans.premium.users',
    priceKey: 'billing.plans.premium.price',
    subpriceKey: 'billing.plans.premium.subprice',
    applicationsKeys: [
      'billing.plans.premium.applications.0',
      'billing.plans.premium.applications.1',
      'billing.plans.premium.applications.2',
      'billing.plans.premium.applications.3',
    ],
    featuresLabelKey: 'billing.plans.premium.featuresLabel',
    featuresKeys: ['billing.plans.premium.features.0'],
  },
  {
    id: Plan.ULTIMATE,
    nameKey: 'billing.plans.ultimate.name',
    usersKey: 'billing.plans.ultimate.users',
    priceKey: 'billing.plans.ultimate.price',
    subpriceKey: 'billing.plans.ultimate.subprice',
    applicationsKeys: [
      'billing.plans.ultimate.applications.0',
      'billing.plans.ultimate.applications.1',
      'billing.plans.ultimate.applications.2',
      'billing.plans.ultimate.applications.3',
      'billing.plans.ultimate.applications.4',
      'billing.plans.ultimate.applications.5',
    ],
    featuresLabelKey: 'billing.plans.ultimate.featuresLabel',
    featuresKeys: ['billing.plans.ultimate.features.0'],
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

  const localizedPlans = plans.map((plan) => ({
    id: plan.id,
    name: t(plan.nameKey),
    users: t(plan.usersKey),
    price: t(plan.priceKey),
    subprice: t(plan.subpriceKey),
    applications: plan.applicationsKeys.map((key) => t(key)),
    features: plan.featuresKeys.map((key) => t(key)),
    ...(plan.featuresLabelKey
      ? { featuresLabel: t(plan.featuresLabelKey) }
      : {}),
  }));

  return (
    <>
      <TeamTab activeTab="billing" team={team} teamFeatures={teamFeatures} />
      <Pricing
        plans={localizedPlans}
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
