import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading, PlatformBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, FleetSecret as FSType, FleetAccount } from '@prisma/client';
import { CreatePack, DeletePack, EditPack } from '@/components/interfaces/Pack';
import { usePacks } from '@/hooks/fleets/packs/usePack';
import { Pack } from '@/types/fleet';
import { PLATFORMS } from '@/lib/fleet/constants';
import { getFleetSecret } from '@/hooks/fleets/useFleetSecret';
import FleetStatus from '../Fleet/FleetStatus';



const Packs = ({ team, fleetAccount }: { team: Team, fleetAccount: Partial<FleetAccount> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Pack>({} as Pack);
  const [taskToDelete, setTaskToDelete] = useState<null | number>(null);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [fleetTeam, setfleetTeam] = useState<Partial<FSType> | null>(null);
  const [secretLoading, setIsLoading] = useState(true);
  const [secretError, setIsError] = useState<string | null>(null);
  
  
  useEffect(() => {
    const fetchSecret = async () => {
      try {
        const secret = await getFleetSecret(team.id);
        setfleetTeam(secret);
      } catch (error) {
        setIsError('error.message');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSecret();
  }, [team.id]);

  const { packs, isLoading, isError } = usePacks(fleetTeam?.fleetTeamId || '', fleetAccount?.accessPhrase!);

  if (isLoading || secretLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <FleetStatus />
        {/* <Error /> */}
      </>
    );
  }

  const openDeleteModal = async (id: number) => {
    setTaskToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = async (pack: Pack) => {
    setTaskToEdit({ ...pack });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {!fleetAccount.connected ?
        <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('fleet-all-packs')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('fleet-pack-listed')}
            </p>
          </div>

          {canAccess('task', ['create']) && (
            <Button
              size="sm"
              color="primary"
              variant="outline"
              onClick={() => {
                setVisible(!visible);
              }}
            >
              {t('create')}
            </Button>
          )}
        </div>
        <table className="text-sm table w-full border-b dark:border-base-200">
          <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                {t('fleet-pack-id')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('name')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('platform')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('version')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('shard')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {packs &&
              packs.map((pack) => {
                return (
                  <tr key={pack.id}>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/packs/${pack.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{pack.id}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/packs/${pack.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{pack.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <PlatformBadge
                        value={pack.platform!}
                        label={
                          PLATFORMS.find(({ value }) => value === pack.platform)
                            ?.label as string
                        }
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-start space-x-2">
                        <span className="">{pack.version}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-start space-x-2">
                        <span className="">{pack.shard}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="gap-2 btn-group">
                        {canAccess('task', ['update']) && (
                          <Button
                            className="dark:text-gray-100"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              openEditModal(pack);
                            }}
                          >
                            {t('edit-task')}
                          </Button>
                        )}
                        {canAccess('task', ['delete']) && (
                          <Button
                            className="dark:text-gray-100"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              openDeleteModal(pack.id);
                            }}
                          >
                            {t('delete')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <CreatePack fleetAccount={fleetAccount} fleetTeamId={fleetTeam?.fleetTeamId!} visible={visible} setVisible={setVisible} team={team} />
        {editVisible && (
          <EditPack
            visible={editVisible}
            setVisible={setEditVisible}
            team={team}
            pack={taskToEdit}
          />
        )}
        <DeletePack
          visible={deleteVisible}
          setVisible={setDeleteVisible}
          taskNumber={taskToDelete}
        />
        </div>
        :
        <>
          <FleetStatus status='disconnected' />
        </>
    }
    </WithLoadingAndError>
  );
};

export default Packs;
