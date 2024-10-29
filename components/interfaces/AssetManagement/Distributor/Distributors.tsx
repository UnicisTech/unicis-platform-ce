import { useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, User } from '@prisma/client';
import { DistributedQuery } from '@/types/fleet';
import FleetStatus from '../Fleet/FleetStatus';
import CreateQuery from './CreateDistributor';
import { CodeBlock } from '@atlaskit/code';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';
import EditDistributor from './EditDistributor';
import DeleteDistributor from './DeleteDistributorResult';
import FormattedDate from '@/components/shared/Date';
import StatusValue from '../StatusValue';


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

  const { tasks, isLoading, isError } = useDistributors(team?.fleetTeamId || '', user?.fleetAccessPhrase!);

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
                {t('distributor')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('fleet-distributor-discription')}
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
                {t('sql')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('total-results')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('not-before')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('task')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks &&
              tasks.map((task, index) => {
                return (
                  <tr key={task.id}>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/distributors/${task.distributed_query.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{index}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/teams/${slug}/asset-management/distributors/${task.distributed_query.id}`}>
                        <div className="flex items-center justify-start space-x-2">
                          <CodeBlock language="sql" shouldWrapLongLines codeBidiWarningTooltipEnabled i18nIsDynamicList={true} showLineNumbers={false} text={task.distributed_query.sql} />
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-start space-x-2">
                        <span className="">{task.distributed_query.total_results}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-start space-x-2">
                        <span className="">{task.distributed_query.not_before}</span>
                      </div>
                    </td>
                    <td className="py-3 w-[25%] align-top">
                      <div className="grid grid-cols-1 gap-1 text-center font-bold items-center justify-start">
                        <div className="bg-gray-700 rounded-xs">
                          <h1 className="rounded-xs text-[10px] bg-gray-600">GUID</h1>
                          <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{task.guid}</span>
                        </div>
                        <div className="bg-gray-700 rounded-xs">
                          <h1 className="rounded-xs text-[10px] bg-gray-600">Status</h1>
                          <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{StatusValue(task.status)}</span>
                        </div>
                        <div className="bg-gray-700 rounded-xs">
                          <h1 className="rounded-xs text-[10px] bg-gray-600">Timestamp</h1>
                          {task.timestamp != null ?
                            <FormattedDate style={'text-[10px]'} dateString={task.timestamp} />
                            :
                            'Null'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="gap-2 btn-group">
                        {canAccess('team_fleet_pack', ['delete']) && (
                          <Button
                            className="dark:text-gray-100"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              openDeleteModal(task.distributed_query.id);
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
          <DeleteDistributor
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            distributorId={distributorToDelete!}
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
