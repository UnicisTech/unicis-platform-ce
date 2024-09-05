import { Error, Loading } from '@/components/shared';
import useTeam from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import type { FleetAccount, FleetSecret as FSType, User } from '@prisma/client';
import FleetSecret from './FleetSecret';
import FleetSetting from './FleetSetting';


const FleetContainer = (
  {
    user,
    fleetAccount
  }: {
      user: Partial<User>,
      fleetAccount: Partial<FleetAccount>,
  }) => {
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
      <FleetSecret user={user} fleetAccount={fleetAccount} team={team}/>
      <FleetSetting user={user} fleetAccount={fleetAccount}/>
    </>
  );
};

export default FleetContainer;
