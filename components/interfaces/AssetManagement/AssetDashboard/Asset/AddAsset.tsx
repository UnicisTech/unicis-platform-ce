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
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { cn } from '@/components/shadcn/lib/utils';

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
  const [isSecretVisible, setIsSecretVisible] = useState(false);

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
  const enrollCommandOptions = {
    secret: secret?.secret ?? '',
    teamName: team.name!,
    apiUrl: fleetApiHost,
    platform: platform,
    tlsServerCerts: shouldUseTlsServerCert ? tlsServerCertPath : undefined,
  };
  const visibleOsqueryEntry = getOsqueryEnrollCommand({
    ...enrollCommandOptions,
    safe: !isSecretVisible,
  });
  const completeOsqueryEntry = getOsqueryEnrollCommand({
    ...enrollCommandOptions,
    safe: true,
    isCopy: true,
  });
  const commandLanguage = platform === 'windows' ? 'powershell' : 'sh';

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="flex justify-between items-start gap-4">
          <DialogTitle className="text-lg font-bold">
            {t('add-asset')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <PlatformTab
            activeTab={platform}
            setTab={(nextPlatform) => {
              setPlatformTab(nextPlatform);
              setIsSecretVisible(false);
            }}
          />

          <div
            id="asset-platform-panel"
            role="tabpanel"
            aria-labelledby={`asset-platform-tab-${platform}`}
            className="space-y-6"
          >
            <p className="text-sm text-muted-foreground">
              {t('generate-installer-description')}
            </p>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="underline">{t('enroll-asset')}</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                  aria-pressed={isSecretVisible}
                  onClick={() => setIsSecretVisible((visible) => !visible)}
                >
                  {isSecretVisible ? (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isSecretVisible
                    ? t('fleet:fleet-hide-enrollment-secret')
                    : t('fleet:fleet-reveal-enrollment-secret')}
                </Button>
              </div>
              <div
                role="status"
                className={cn(
                  'flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-relaxed',
                  isSecretVisible
                    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                )}
              >
                {isSecretVisible ? (
                  <EyeIcon
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <EyeSlashIcon
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>
                  {isSecretVisible
                    ? t('fleet:fleet-enrollment-secret-visible-notice')
                    : t('fleet:fleet-enrollment-secret-hidden-notice')}
                </span>
              </div>
              <CodeBlock
                language={commandLanguage}
                shouldWrapLongLines
                showLineNumbers={false}
                text={visibleOsqueryEntry}
                copyText={completeOsqueryEntry}
                className={isSecretVisible ? undefined : 'select-none'}
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
