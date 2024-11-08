import React, { useState } from 'react';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Icon } from '@iconify/react';
import CheckboxField from '@atlaskit/checkbox';
import { CodeBlock } from '@atlaskit/code';
import { Loading, Error, CopyToClipboardButton } from '@/components/shared';
import { Team, User } from '@prisma/client';
import { useGetTeam } from '@/hooks/fleets/team/useGetTeam';
import { FLEET_ASSET_MAKER, OSQUERY_ENTRY } from '@/lib/fleet/tools';
import env from '@/lib/env';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
  const [platformTab, setPlatformTab] = useState('windows');
  const [isSafe, setIsPasswordVisible] = useState(false);

  const { fleetTeam, isLoading, isError } = useGetTeam(team.fleetTeamId!, user?.fleetAccessPhrase!);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError} />;
  }

  const fleetEntry = FLEET_ASSET_MAKER({ secret: team.fleetSecret!, teamName: team.name!, apiUrl: env.fleetAPI, safe: isSafe, platform: platformTab });
  const osqueryEntry = OSQUERY_ENTRY({ secret: team.fleetSecret!, teamName: team.name!, apiUrl: env.fleetAPI, safe: isSafe });
  const cliEntry = platformTab === 'advanced' ? osqueryEntry : fleetEntry

  return (
    <Modal open={visible}>
      <div className='flex w-full justify-between'>
        <Modal.Header className="font-bold">{t('add-asset')}</Modal.Header>
        <div className='flex gap-4'>
          <Button
            className="w-fit gap-2"
            size='xs'
            color='ghost'
            onClick={()=>{setIsPasswordVisible(!isSafe)}}
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
        <div className="tabs tabs-lifted mb-4">
          <input type="radio" name="platform_tab" role="tab" onClick={()=>{setPlatformTab('windows')}} className="tab" aria-label="Windows" defaultChecked/>

          <input type="radio" name="platform_tab" role="tab" onClick={()=>{setPlatformTab('linux-rpm')}} className="tab" aria-label="Linux (RPM)" />

          <input type="radio" name="platform_tab" role="tab" className="tab" onClick={()=>{setPlatformTab('linux-deb')}} aria-label="Linux (DEB)" />

          <input type="radio" name="platform_tab" role="tab" className="tab" onClick={()=>{setPlatformTab('apple')}} aria-label="Apple" />

          <input type="radio" name="platform_tab" role="tab" className="tab" onClick={()=>{setPlatformTab('advanced')}} aria-label="Advanced" />
        </div>
        <div>
          <div className='flex gap-2 mb-4'>
            <CheckboxField autoComplete="off" onChange={(checked)=>{}}/> <span>Include</span> <span className='underline'>Fleet Desktop</span>
          </div>
          <div>
            <h1 className='underline'>With the <a className='text-blue-500'>Fleet command-line tool</a> installed:</h1>
            <CopyToClipboardButton value={cliEntry} />
          </div>
          <CodeBlock language="bash" shouldWrapLongLines codeBidiWarningTooltipEnabled i18nIsDynamicList={true} showLineNumbers={false} text={cliEntry} />
          {platformTab === 'advanced' &&
            <>
            <h1>Team TLS Certificate</h1>
            <CodeBlock language="text" showLineNumbers={false} text={fleetTeam?.ca_certificate} />
            <p>Save the CA content in <span className='text-green-500'>./ca-cert.pem</span> or any name with <span className='text-green-500'>.pem</span> extension</p></>
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
