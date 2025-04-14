import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Card, CopyToClipboardButton } from '@/components/shared';
import { Team, User } from '@prisma/client';
import FleetStatus from './FleetStatus';
import { useAccessFleetAccount, useCreateFleetAccount, useCreateFleetTeam } from '@/hooks/fleets';
import { useState } from 'react';
import RenewFleetSecret from './RenewFleetSecret';
import useCanAccess from '@/hooks/useCanAccess';
import { useOrderFleetSecret } from '@/hooks/fleets/connect/useOrderFleetSecret';
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret';
import { useDeleteFleetSecret } from '@/hooks/fleets/connect/useDeleteFleetSecret';
import { CodeBlock } from '@atlaskit/code';
import { getSession } from 'next-auth/react';
import Cookies from 'js-cookie';


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

  const createFleetAccount = useCreateFleetAccount();
  const accessFleetAccount = useAccessFleetAccount();
  const createFleetTeam = useCreateFleetTeam();
  const orderFleetSecret = useOrderFleetSecret();
  const deleteFleetSecret = useDeleteFleetSecret();
  const [renewVisible, setRenewVisible] = useState(false);

  const { canAccess } = useCanAccess();

  const { secret, isLoading, isError, mutateFleetSecret } = useGetFleetSecret(team.id);

  const handleOrderSecret = async () => {
    const session = await getSession();
    console.log(session)
    try {
      await createFleetAccount("c5d02a4d-7aa3-4289-99c5-ba1b89779b42", "vnezdd@gmail.com", "Vitalii", "Nezdvetskyi", "Ocean@25Navigator")
        .then(async () => {
          const { fleet_access } = await accessFleetAccount("vnezdd@gmail.com", "Ocean@25Navigator");
          Cookies.set('ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA', fleet_access.secret_key);
          await createFleetTeam("Team", "6e00b85f-c53f-4129-82f2-a5f8a05c33aa")
            .then(team => { console.log("team", team) }).catch(async (err) => {
              console.log("err", err)
            })
        });
    } catch (error) {
      // await deleteUser({ id: json.data.user.id })
      console.log("error", error)
    }
    try {
      if (!userId) {
        throw new Error('User ID is not defined');
      }
      if (secret?.id === undefined) {
        await createFleetTeam(team.name, team.id);
        await orderFleetSecret(team.id);
        mutateFleetSecret();
        toast.success(t('Fleet Enrollment Secret Ordered'));
      }
    } catch (error) {
      console.log("error", error)
      toast.error(isError?.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFleetSecret(teamId);
      mutateFleetSecret();
      toast.success(t('Successfully deleted'));
    } catch {
      toast.error(t('Error deleting fleet secret'));
    }
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
              <CodeBlock language='text' shouldWrapLongLines={true} text={safe ? '*'.repeat(secret?.secret.length!) : `${secret?.secret!}`} />
              {secret?.secret! != null &&
                <div>
                  <CopyToClipboardButton value={secret?.secret!} />
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
            loading={isLoading}
            disabled={secret?.id === null}
            onClick={handleOrderSecret}
            size="md"
          >
            {t('fleet-order-secret')}
          </Button>
          :
          <Button
            type="button"
            loading={isLoading}
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
            loading={isLoading}
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
