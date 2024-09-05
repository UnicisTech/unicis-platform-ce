import type { FleetAccount, User } from '@prisma/client';
import UploadAvatar from './UploadAvatar';
import UpdateName from './UpdateName';
import UpdateEmail from './UpdateEmail';
import UpdateTheme from './UpdateTheme';
import env from '@/lib/env';
import ConnectFleet from '../interfaces/Fleet/ConnectFleet';
import { FleetInfo } from '../interfaces/Fleet';

interface UpdateAccountProps {
  user: Partial<User>;
  fleetAccount: Partial<FleetAccount>,
  allowEmailChange: boolean;
}

const UpdateAccount = ({ fleetAccount, user, allowEmailChange }: UpdateAccountProps) => {
  return (
    <div className="flex gap-6 flex-col">
      <UpdateName user={user} />
      <UpdateEmail user={user} allowEmailChange={allowEmailChange} />
      <UploadAvatar user={user} />
      <ConnectFleet user={user} fleetAccount={fleetAccount} />
      <FleetInfo user={user} fleetAccount={fleetAccount}/>
      {env.darkModeEnabled && <UpdateTheme />}
    </div>
  );
};

export default UpdateAccount;
