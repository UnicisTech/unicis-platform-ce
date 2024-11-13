import { Error } from '@/components/shared';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import type { Team, User } from '@prisma/client';
import FleetSecret from './FleetSecret';
import { useState } from 'react';
import FleetConnectRequired from '../FleetConnectRequired';
import Button from '@atlaskit/button';


const FleetContainer = (
  {
    user,
    team
  }: {
    user: Partial<User>,
    team: Team,
  }) => {
  const { t } = useTranslation('common');
  const [isSafe, setIsPasswordVisible] = useState(false);

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isSafe);
  };

  return (
    <FleetConnectRequired user={user}>
      {({ isAuthenticated, hasRole, logout }) => (
        <>
          <button
            type="button"
            className="flex gap-2"
            onClick={togglePasswordVisibility}
          >
            Safe Sensitives
            {isSafe ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          <FleetSecret user={user} team={team} safe={isSafe} />
          {/* <FleetTools fleetTeam={fleetTeam}/>
      <FleetHelper team={team} safe={isSafe} /> */}
        </>
      )}
    </FleetConnectRequired>
  );
};

export default FleetContainer;
