import { Error, Loading } from '@/components/shared';
import useTeam from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import type { User } from '@prisma/client';
import FleetSecret from './FleetSecret';
import FleetHelper from './FleetHelper';


const FleetContainer = (
  {
    user
  }: {
      user: Partial<User>,
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
      <FleetSecret user={user} team={team}/>
      <FleetHelper team={team}/>
    </>
  );
};

export default FleetContainer;
