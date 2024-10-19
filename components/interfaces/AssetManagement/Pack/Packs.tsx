import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading, PlatformBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, User } from '@prisma/client';
import { CreatePack, DeletePack, EditPack } from '@/components/interfaces/AssetManagement/Pack';
import { usePacks } from '@/hooks/fleets/packs/usePack';
import { Pack } from '@/types/fleet';
import { PLATFORMS } from '@/lib/fleet/constants';
import FleetStatus from '../Fleet/FleetStatus';



const Packs = ({ team, user }: { team: Team, user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToEdit, setPackToEdit] = useState<Pack>({} as Pack);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  
  const { packs, isLoading, isError } = usePacks(team?.fleetTeamId || '', user?.fleetAccessPhrase!);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <Error />
      </>
    );
  }

  const openDeleteModal = async (id: string) => {
    setPackToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = async (pack: Pack) => {
    setPackToEdit({ ...pack });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user.fleetAccessPhrase ?
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

          {canAccess('team_fleet_pack', ['create']) && (
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
                {t('Index')}
              </th>
              {/* <th scope="col" className="px-6 py-3">
                {t('fleet-pack-id')}
              </th> */}
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
              packs.map((pack, index) => {
                return (
                  <tr key={pack.id}>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/packs/${pack.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{index}</span>
                        </div>
                      </Link>
                    </td>
                    {/* <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/packs/${pack.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{pack.id}</span>
                        </div>
                      </Link>
                    </td> */}
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/packs/${pack.id}`}>
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
                        {canAccess('team_fleet_pack', ['update']) && (
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
                        {canAccess('team_fleet_pack', ['delete']) && (
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
        <CreatePack user={user} fleetTeamId={team?.fleetTeamId!} visible={visible} setVisible={setVisible}/>
        {editVisible && (
          <EditPack
            visible={editVisible}
            setVisible={setEditVisible}
            team={team}
            pack={packToEdit}
            fleetTeamId={team?.fleetTeamId!}
            fleetAccessPhrase={user.fleetAccessPhrase!}
          />
        )}
        <DeletePack
          visible={deleteVisible}
          setVisible={setDeleteVisible}
          packId={packToDelete!}
          fleetTeamId={team?.fleetTeamId!}
          fleetAccessPhrase={user.fleetAccessPhrase!}
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
