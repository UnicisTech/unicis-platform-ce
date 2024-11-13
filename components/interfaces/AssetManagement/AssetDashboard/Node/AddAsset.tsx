import React, { useState } from 'react';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Icon } from '@iconify/react';
import CheckboxField from '@atlaskit/checkbox';
import { CodeBlock } from '@atlaskit/code';
import { Loading, Error, CopyToClipboardButton } from '@/components/shared';
import { Team, User } from '@prisma/client';
import { useGetTeam } from '@/hooks/fleets/team/useGetTeam';
import { OSQUERY_ENTRY } from '@/lib/fleet/tools';
import env from '@/lib/env';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret';
import PlatformTab from '../PlatformTab';

const AddAsset = ({
  visible,
  team,
  user,
  setVisible
}: {
  visible: boolean;
  team: Team,
  user: Partial<User>
  setVisible: (visible: boolean) => void;
}) => {
  const { t } = useTranslation('common');
  const [platform, setPlatformTab] = useState('windows');
  const [include, setInclude] = useState(false);
  const [isSafe, setIsPasswordVisible] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  const { fleetTeam, isLoading, isError } = useGetTeam(team.id);
  const { secret, isLoading: SecretLoading, isError: SecretError } = useGetFleetSecret(team.id);

  if (isLoading || SecretLoading) {
    return <Loading />;
  }

  if (isError || SecretError) {
    return <Error />;
  }

  const agentEndpoint = (os: string, version: string) => {
    if (os === 'windows') {
      return `osquery-${version}.msi`;
    } else if (os === 'mac') {
      return `osquery-${version}_1.macos_arm64.tar.gz`;
    } else if (os === 'linux-deb') {
      return `osquery_${version}-1.linux_amd64.deb`;
    } else if (os === 'linux-rpm') {
      return `osquery-${version}-1.linux.x86_64.rpm`;
    } else {
      return `https://github.com/osquery/osquery/archive/refs/tags/${version}.zip`;
    }
  };

  const generateCliInstaller = (os: string) => {
    const url = `https://github.com/osquery/osquery/releases/download/${env.agentVersion}/${agentEndpoint(os, env.agentVersion )}`;
    return platform === 'advanced' ? agentEndpoint(os, env.agentVersion) : `curl -sSL ${url} | tar -xzf -`;
  };

  const generateUrlInstaller = (os: string) => {
    const url = `https://github.com/osquery/osquery/releases/download/${env.agentVersion}/${agentEndpoint(os, env.agentVersion)}`;
    return platform === 'advanced' ? agentEndpoint(os, env.agentVersion) : url;
  };

  const osqueryEntry = OSQUERY_ENTRY({ secret: secret?.secret!, teamName: team.name!, apiUrl: env.fleetAPI, safe: isSafe, isCopy: isCopy, platform: platform });

  return (
    <Modal open={visible}>
      <div className='flex w-full justify-between'>
        <Modal.Header className="font-bold">{t('add-asset')}</Modal.Header>
        <div className='flex gap-4'>
          <Button
            className="w-fit gap-2"
            size='xs'
            color='ghost'
            onClick={() => { setIsPasswordVisible(!isSafe) }}
          >
            {isSafe ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </Button>
          <Icon
            className='h-4 w-4'
            icon='ic:round-close'
            onClick={() => {
              setVisible(false);
            }}
          />
        </div>
      </div>
      <Modal.Body>
        <PlatformTab activeTab={platform} setTab={setPlatformTab}/>
        <div>
          {platform === 'advanced' &&
            <div className='grid grid-cols-4 gap-2 mb-4'>
              <CheckboxField autoComplete="off" isChecked={include} onChange={() => {  }} label={'Logger'} />
              <CheckboxField autoComplete="off" isChecked={include} onChange={() => {  }} label={'Daemon'} />
              <CheckboxField autoComplete="off" isChecked={include} onChange={() => {  }} label={'Shell'} />
              <CheckboxField autoComplete="off" isChecked={include} onChange={() => {  }} label={'Re-enroll'} />
            </div>
          }
          <div className='flex justify-between'>
            <h1 className='underline'>With CLI installer:</h1>
            <CopyToClipboardButton value={osqueryEntry} />
          </div>
          <CodeBlock language="sh" shouldWrapLongLines codeBidiWarningTooltipEnabled i18nIsDynamicList={true} showLineNumbers={false} text={generateCliInstaller(platform)} />
          <div className='flex justify-between'>
            <h1 className='underline'>With the <a download={generateUrlInstaller(platform)} className='text-blue-500'>Fleet command-line tool</a> installed:</h1>
            <CopyToClipboardButton value={osqueryEntry} />
          </div>
          <CodeBlock language="sh" shouldWrapLongLines codeBidiWarningTooltipEnabled i18nIsDynamicList={true} showLineNumbers={false} text={osqueryEntry} />
          {platform === 'advanced' &&
            <>
            <h1>Team TLS Certificate</h1>
            <CodeBlock language="text" showLineNumbers={false} text={fleetTeam?.ca_certificate} />
            <p>Save the CA content in <span className='text-green-500'>./ca-cert.pem</span> or any name with <span className='text-green-500'>.pem</span> extension</p>
            </>
          }
          <span className='text-sm'>Generates an installer that your devices will use to connect to Fleet</span>
        </div>
      </Modal.Body>
      <Modal.Actions>
        <Button
          type="button"
          variant="outline"
          size='sm'
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {t('done')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default AddAsset;
