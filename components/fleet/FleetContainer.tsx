import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import type { FleetAccount, FleetSecret as FSType, User } from '@prisma/client';
import FleetSecret from './FleetSecret';
import { TeamFeature } from 'types';

const FleetContainer = ({ teamFeatures, user, fleetSecret, fleetAccount }: { user: Partial<User>, fleetAccount: Partial<FleetAccount>, teamFeatures: TeamFeature , fleetSecret: FSType }) => {
  const { t } = useTranslation('common');

  const { isLoading, isError, team } = useTeam();

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
      <FleetSecret user={user} fleetAccount={fleetAccount} team={team} fleetSecret={fleetSecret} />
    </>
  );
};

export default FleetContainer;
