import { Error, Loading } from '@/components/shared';
import useTeam from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import type { FleetAccount, FleetSecret as FSType, User } from '@prisma/client';
import FleetSecret from './FleetSecret';
import { TeamFeature } from 'types';
import ConnectFleet from './ConnectFleet';
import FleetSetting from './FleetSetting';
import FleetInfo from './FleetInfo';


const FleetContainer = (
  {
    teamFeatures,
    user,
    fleetAccount
  }: {
      user: Partial<User>,
      fleetAccount: Partial<FleetAccount>,
      teamFeatures: TeamFeature
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
      <ConnectFleet team={team} user={user} fleetAccount={fleetAccount} />
      <FleetSecret user={user} fleetAccount={fleetAccount} team={team}/>
      <FleetInfo user={user} fleetAccount={fleetAccount}/>
      <FleetSetting user={user} fleetAccount={fleetAccount}/>
    </>
  );
};

export default FleetContainer;
