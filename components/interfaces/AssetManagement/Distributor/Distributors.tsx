import { useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading, PlatformBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, User } from '@prisma/client';
import { DistributedQuery } from '@/types/fleet';
import { PLATFORMS } from '@/lib/fleet/constants';
import FleetStatus from '../Fleet/FleetStatus';
import CreateQuery from './CreateDistributor';
import { Code } from '@atlaskit/code';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';
import EditDistributor from './EditDistributor';
import DeleteDistributor from './DeleteDistributorResult';


const Distributors = ({ team, user }: { team: Team, user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [distributorToEdit, setDistributorToEdit] = useState<DistributedQuery>({} as DistributedQuery);
  const [distributorToDelete, setDistributorToDelete] = useState<null | string>(null);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();

  const { distributors, isLoading, isError } = useDistributors(team?.fleetTeamId || '', user?.fleetAccessPhrase!);

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
    setDistributorToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = async (distributor: DistributedQuery) => {
    setDistributorToEdit({ ...distributor });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user.fleetAccessPhrase ?
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('fleet-all-querys')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('fleet-querys-listed')}
              </p>
            </div>
          
            {canAccess('team_fleet_query', ['create']) && (
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
                {t('index')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('not_before')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('sql')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('discription')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {distributors &&
              distributors.map((distributor) => {
                return (
                  <tr key={distributor.id}>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/distributors/${distributor.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{distributor.index}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/distributors/${distributor.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{distributor.not_before}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/distributors/${distributor.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <Code onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>{distributor.sql}</Code>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-start space-x-2">
                        <span className="">{distributor.description}</span>
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
                              openEditModal(distributor);
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
                              openDeleteModal(distributor.id);
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

          <CreateQuery user={user} fleetTeamId={team?.fleetTeamId!} visible={visible} setVisible={setVisible} />
          {editVisible && (
            <EditDistributor
              visible={editVisible}
              setVisible={setEditVisible}
              distributor={distributorToEdit}
              fleetAccessPhrase={user.fleetAccessPhrase!}
              fleetTeamId={team?.fleetTeamId!}
            />
          )}
          <DeleteDistributor
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            queryId={distributorToDelete!}
            fleetAccessPhrase={user.fleetAccessPhrase!}
            fleetTeamId={team?.fleetTeamId!}
          />
        </div>
        :
        <>
          <FleetStatus status='disconnected'/>
        </>
      }
    </WithLoadingAndError>
  );
};

export default Distributors;
