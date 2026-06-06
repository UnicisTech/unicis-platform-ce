import type { User } from '@/generated/client';
import SettingsFleet from '../interfaces/AssetManagement/Fleet/FleetSettings';
import AccountTab from './AccountTab';
import FleetAccountTab from './FleetAccountTab';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

interface FleetAccountProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const FleetAccountManager = ({
  user,
  allowEmailChange: _allowEmailChange,
}: FleetAccountProps) => {
  const [activeTab, setActiveTab] = useState('Connect');
  const { t } = useTranslation('common');

  return (
    <div>
      <AccountTab activeTab="fleet" user={user} />
      <FleetAccountTab activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'Connect' && (
        <>
          <SettingsFleet user={user} />
        </>
      )}
      {activeTab === 'Webhook' && <>{t('webhooks')}</>}
    </div>
  );
};

export default FleetAccountManager;
