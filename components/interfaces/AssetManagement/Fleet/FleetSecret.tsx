import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Card, CopyToClipboardButton, InputWithLabel } from '@/components/shared';
import { Team, User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { useCreateFleetTeam } from '@/hooks/fleets';
import { useEffect, useRef, useState } from 'react';
import RenewFleetSecret from './RenewFleetSecret';
import useCanAccess from '@/hooks/useCanAccess';
import { useOrderFleetSecret } from '@/hooks/fleets/connect/useOrderFleetSecret';
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret';
import { useDeleteFleetSecret } from '@/hooks/fleets/connect/useDeleteFleetSecret';
import { CodeBlock } from '@atlaskit/code';
import useSWR from 'swr';


const FleetSecret = (
  {
    user,
    team,
    safe = true
  }: {
    user: Partial<User>,
    team: Team,
    safe?: boolean
  }) => {
  const { t } = useTranslation('common');
  const userId = user.id;
  const teamId = team.id;

  const createFleetTeam = useCreateFleetTeam();
  const orderFleetSecret = useOrderFleetSecret();
  const deleteFleetSecret = useDeleteFleetSecret();
  const [renewVisible, setRenewVisible] = useState(false);

  const { canAccess } = useCanAccess();

  const { secret, isLoading, isError } = useGetFleetSecret(team.id);
  const { data, mutate } = useSWR('/api/your-endpoint', useGetFleetSecret);

  const handleOrderSecret = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not defined');
      }
      if (secret?.id === undefined) {
        await createFleetTeam(team.name, team.id);
        await orderFleetSecret(team.id);
        toast.success(t('Fleet Enrollment Secret Ordered'));
      }
    } catch (error) {

    }
  };

  const handleDelete = async () => {
    await deleteFleetSecret(teamId);
    toast.success(t('fleet-secret-delete'));
  };

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('fleet-secret')}</Card.Title>
          <Card.Description>{t('fleet-secret-description')}</Card.Description>
        </Card.Header>
        <div className="flex flex-col space-y-3">
          {!user ?
            <FleetStatus status='access-not-granted' />
            :
            <>
              {/* <FleetStatus status='connected' /> */}
              <CodeBlock language='text' shouldWrapLongLines={true} text={safe ? '*'.repeat(data?.secret?.secret.length!) : `${data?.secret?.secret!}`} />
              {data?.secret?.secret! != null &&
                <div>
                  <CopyToClipboardButton value={data?.secret?.secret!} />
                </div>
              }
            </>
          }
          {secret?.secret! == null &&
            <FleetStatus status='no-fleet-secret' />
          }
        </div>
      </Card.Body>
      <Card.Footer>
        {secret?.secret === undefined ?
          <Button
            type="button"
            loading={false}
            disabled={secret?.id === null}
            onClick={handleOrderSecret}
            size="md"
          >
            {t('fleet-order-secret')}
          </Button>
          :
          <Button
            type="button"
            loading={false}
            disabled={!secret?.secret!}
            onClick={handleDelete}
            size="md"
          >
            {t('fleet-secret-reset')}
          </Button>
        }
        {secret?.secret !== undefined &&
          <Button
            type="button"
            loading={false}
            disabled={!secret?.secret!}
            onClick={() => setRenewVisible(true)}
            size="md"
          >
            {t('fleet-renew-secret')}
          </Button>
        }
      </Card.Footer>
      <RenewFleetSecret
        teamId={teamId}
        setVisible={setRenewVisible}
        visible={renewVisible}
      />
    </Card>
  );
};

export default FleetSecret;
