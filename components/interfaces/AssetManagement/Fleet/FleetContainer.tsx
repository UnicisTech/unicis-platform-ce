import { Error } from '@/components/shared';
// import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import type { Team, User } from '@/generated/client';
import FleetSecret from './FleetSecret';

const FleetContainer = ({
  user,
  team,
}: {
  user: Partial<User>;
  team: Team;
}) => {
  const { t } = useTranslation('common');

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      {/* <button
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
      </button> */}
      <FleetSecret
        user={user}
        team={team}
        // safe={isSafe}
      />
    </>
  );
};

export default FleetContainer;
