import type { User, FleetAccount } from '@prisma/client';
import ConnectFleet from './ConnectFleet';
import FleetSetting from './FleetSetting';
import FleetInfo from './FleetInfo';

interface EnrollProps {
  user: Partial<User>;
  fleetAccount: Partial<FleetAccount>;
}

const FleetAccount = ({ user, fleetAccount }: EnrollProps) => {
  return (
    <div className="flex gap-6 flex-col">
      <ConnectFleet user={user} fleetAccount={fleetAccount} />
      <FleetInfo user={user} fleetAccount={fleetAccount}/>
      <FleetSetting user={user} fleetAccount={fleetAccount}/>
    </div>
  );
};

export default FleetAccount;
