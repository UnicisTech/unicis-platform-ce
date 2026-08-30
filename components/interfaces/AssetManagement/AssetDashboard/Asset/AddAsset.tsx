'use client';

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Team, User } from '@/generated/client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { useGetTeam } from '@/hooks/fleets/team/useGetTeam';
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret';
import {
  getOsqueryEnrollCommand,
  getOsqueryInstallCommand,
  type OsqueryPlatform,
} from '@/lib/fleet/tools';
import env from '@/lib/env';
import { Loading, Error } from '@/components/shared';
import { CodeBlock } from '@/components/shared/CodeBlock';
import PlatformTab from '../PlatformTab';

type AddAssetProps = {
  visible: boolean;
  team: Team;
  user: Partial<User>;
  setVisible: (visible: boolean) => void;
};

const AddAsset = ({
  visible,
  team,
  user: _user,
  setVisible,
}: AddAssetProps) => {
  const { t } = useTranslation(['common', 'fleet']);
  const [platform, setPlatformTab] = useState<OsqueryPlatform>('windows');
  const [isSafe] = useState(false);
  const [isCopy] = useState(false);

  const { fleetTeam, isLoading, isError } = useGetTeam(team.id);
  const {
    secret,
    isLoading: SecretLoading,
    isError: SecretError,
  } = useGetFleetSecret(team.id);

  if (isLoading || SecretLoading) return <Loading />;
  if (isError || SecretError) return <Error />;

  const fleetApiHost = (() => {
    if (env.fleetAPI) {
      return env.fleetAPI;
    }

    if (!env.fleetAPIUrl) {
      return '';
    }

    try {
      return new URL(env.fleetAPIUrl).host;
    } catch {
      return '';
    }
  })();

  const tlsServerCertPath =
    platform === 'windows' ? '.\\ca-cert.pem' : './ca-cert.pem';
  const shouldUseTlsServerCert =
    env.fleetUseTlsServerCerts && Boolean(fleetTeam?.ca_certificate);

  const installCommand = getOsqueryInstallCommand(platform, env.agentVersion);
  const osqueryEntry = getOsqueryEnrollCommand({
    secret: secret?.secret ?? '',
    teamName: team.name!,
    apiUrl: fleetApiHost,
    safe: isSafe,
    isCopy: isCopy,
    platform: platform,
    tlsServerCerts: shouldUseTlsServerCert ? tlsServerCertPath : undefined,
  });
  const commandLanguage = platform === 'windows' ? 'powershell' : 'sh';

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="flex justify-between items-start gap-4">
          <DialogTitle className="text-lg font-bold">
            {t('add-asset')}
          </DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPasswordVisible(!isSafe)}
          >
            {isSafe ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </Button> */}
        </DialogHeader>

        <div className="space-y-6">
          <PlatformTab activeTab={platform} setTab={setPlatformTab} />

          <div
            id="asset-platform-panel"
            role="tabpanel"
            aria-labelledby={`asset-platform-tab-${platform}`}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="underline">{t('install-osquery')}</h2>
              </div>
              <CodeBlock
                language={commandLanguage}
                shouldWrapLongLines
                showLineNumbers={false}
                text={installCommand}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="underline">{t('enroll-asset')}</h2>
              </div>
              <CodeBlock
                language={commandLanguage}
                shouldWrapLongLines
                showLineNumbers={false}
                text={osqueryEntry}
              />
            </div>

            {shouldUseTlsServerCert && (
              <>
                <h2>{t('team-tls-cert')}</h2>
                <CodeBlock
                  language="text"
                  showLineNumbers={false}
                  text={fleetTeam?.ca_certificate}
                />
                <p>
                  {t('save-ca-content', {
                    file: tlsServerCertPath,
                    ext: '.pem',
                  })}
                </p>
              </>
            )}

            <p className="text-sm text-muted-foreground">
              {t('generate-installer-description')}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              {t('done')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAsset;
