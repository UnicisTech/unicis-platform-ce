import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shadcn/ui/button';
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
import { getSession } from 'next-auth/react';
// import Cookies from 'js-cookie';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { Loader2 } from 'lucide-react';

const FleetSecret = ({
  user,
  team,
  safe = true,
}: {
  user: Partial<User>;
  team: Team;
  safe?: boolean;
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
    // try {
    //   await createFleetAccount("7258eda7-cd4d-49df-bccc-1ca0ab70c211", "vnezdd@gmail.com", "Vitalii", "Nezdvetskyi", "Ocean@25Navigator")
    //     .then(async () => {
    //       const { fleet_access } = await accessFleetAccount("vnezdd@gmail.com", "Ocean@25Navigator");
    //       console.log("fleet_access", fleet_access)
    //       Cookies.set('ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA', fleet_access.secret_key);
    //     });
    // } catch (error) {
    //   // await deleteUser({ id: json.data.user.id })
    //   console.log("createFleetAccount error", error)
    // }
    
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
          {!user ? (
            <FleetStatus status="access-not-granted" />
          ) : (
            <>
              <CodeBlock
                language="text"
                shouldWrapLongLines={true}
                text={
                  safe
                    ? '*'.repeat(secret?.secret?.length || 0)
                    : secret?.secret || ''
                }
              />
              {secret?.secret && (
                <div>
                  <CopyToClipboardButton value={secret.secret} />
                </div>
              )}
            </>
          )}

          {!secret?.secret && <FleetStatus status="no-fleet-secret" />}
        </div>
      </Card.Body>
      <Card.Footer>
        {secret?.secret === undefined ? (
          <Button
            type="button"
            disabled={isLoading || secret?.id === null}
            onClick={handleOrderSecret}
            size="sm"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('fleet-order-secret')}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isLoading || !secret?.secret}
            onClick={handleDelete}
            size="sm"
            variant="destructive"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('fleet-secret-reset')}
          </Button>
        )}

        {secret?.secret !== undefined && (
          <Button
            type="button"
            disabled={isLoading || !secret?.secret}
            onClick={() => setRenewVisible(true)}
            size="sm"
            variant="secondary"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('fleet-renew-secret')}
          </Button>
        )}
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
