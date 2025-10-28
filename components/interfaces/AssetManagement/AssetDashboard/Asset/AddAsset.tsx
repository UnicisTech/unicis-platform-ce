'use client';

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Team, User } from '@prisma/client';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Trans } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { useGetTeam } from '@/hooks/fleets/team/useGetTeam';
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret';
import { OSQUERY_ENTRY } from '@/lib/fleet/tools';
import env from '@/lib/env';
import { Loading, Error, CopyToClipboardButton } from '@/components/shared';
import { CodeBlock } from '@/components/shared/CodeBlock';
import PlatformTab from '../PlatformTab';

type AddAssetProps = {
  visible: boolean;
  team: Team;
  user: Partial<User>;
  setVisible: (visible: boolean) => void;
};

const AddAsset = ({ visible, team, user, setVisible }: AddAssetProps) => {
  const { t } = useTranslation('common');
  const [platform, setPlatformTab] = useState('windows');
  const [isSafe, setIsPasswordVisible] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  const { fleetTeam, isLoading, isError } = useGetTeam(team.id);
  const { secret, isLoading: SecretLoading, isError: SecretError } = useGetFleetSecret(team.id);

  if (isLoading || SecretLoading) return <Loading />;
  if (isError || SecretError) return <Error />;

  const agentEndpoint = (os: string, version: string) => {
    switch (os) {
      case 'windows': return `osquery-${version}.msi`;
      case 'macos': return `osquery-${version}_1.macos_arm64.tar.gz`;
      case 'linux-deb': return `osquery_${version}-1.linux_amd64.deb`;
      case 'linux-rpm': return `osquery-${version}-1.linux.x86_64.rpm`;
      default: return `https://github.com/osquery/osquery/archive/refs/tags/${version}.zip`;
    }
  };

  const generateCliInstaller = (os: string) => {
    const url = `https://github.com/osquery/osquery/releases/download/${env.agentVersion}/${agentEndpoint(os, env.agentVersion)}`;
    return `curl -sSL ${url} | tar -xzf -`;
  };

  const generateUrlInstaller = (os: string) => {
    const url = `https://github.com/osquery/osquery/releases/download/${env.agentVersion}/${agentEndpoint(os, env.agentVersion)}`;
    return platform === 'advanced' ? agentEndpoint(os, env.agentVersion) : url;
  };

  const osqueryEntry = OSQUERY_ENTRY({ secret: secret?.secret!, teamName: team.name!, apiUrl: env.fleetAPI, safe: isSafe, isCopy: isCopy, platform: platform });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="flex justify-between items-start gap-4">
          <DialogTitle className="text-lg font-bold">{t('add-asset')}</DialogTitle>
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="underline">{t('with-cli-installer')}</h2>
              {/* <CopyToClipboardButton value={osqueryEntry} /> */}
            </div>
            <CodeBlock
              language="sh"
              shouldWrapLongLines
              showLineNumbers={false}
              text={generateCliInstaller(platform)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
            <h2 className="underline">
              With the <a href={generateUrlInstaller(platform)} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Fleet command-line tool</a> installed:
            </h2>
              {/* <CopyToClipboardButton value={osqueryEntry} /> */}
            </div>
            <CodeBlock
              language="sh"
              shouldWrapLongLines
              showLineNumbers={false}
              text={osqueryEntry}
            />
          </div>

          {platform === 'advanced' && (
            <>
              <h2>{t('team-tls-cert')}</h2>
              <CodeBlock language="text" showLineNumbers={false} text={fleetTeam?.ca_certificate} />
              <p>Save the CA content in <span className='text-green-500'>./ca-cert.pem</span> or any name with <span className='text-green-500'>.pem</span> extension</p>
            </>
          )}

          <p className="text-sm text-muted-foreground">{t('generate-installer-description')}</p>
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
