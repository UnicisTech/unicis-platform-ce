import { useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, User } from '@prisma/client';
import FleetStatus from '../Fleet/FleetStatus';
import FormattedDate from '@/components/shared/Date';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import DeleteNode from './DeleteNode';



const Nodes = ({ team, user }: { team: Team, user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [status, setStatus] = useState('all');
  
  const { nodes, isLoading, isError } = useNodes(team.fleetTeamId!, user?.fleetAccessPhrase!, status);

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
    setNodeToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user.fleetAccessPhrase ?
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('fleet-all-nodes')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('fleet-node-listed')}
              </p>
            </div>

            {canAccess('team_fleet_node', ['read']) && (
              <Button
                size="sm"
                color="error"
                variant="outline"
                onClick={() => {
                  setStatus('inactive');
                }}
              >
                {t('inactive-nodes')}
              </Button>
            )}

            {canAccess('team_fleet_node', ['read']) && (
              <Button
                size="sm"
                color="success"
                variant="outline"
                onClick={() => {
                  setStatus('active');
                }}
              >
                {t('active-nodes')}
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
                  {t('value')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('created_at')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('Analysis')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {nodes &&
                nodes.map((node) => {
                  return (
                    <tr key={node.id}>
                      <td className="px-6 py-3">
                        <Link href={`/teams/${slug}/nodes/${node.id}`}>
                          <div className="flex items-center justify-start space-x-2">
                            <span className="underline">{node.index}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <Link href={`/teams/${slug}/nodes/${node.id}`}>
                          <div className="flex items-center justify-start space-x-2">
                            <span className="underline">{node.host_identifier}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-start space-x-2">
                          <FormattedDate style={'text-xs'}  dateString={node.enrolled_on} />
                        </div>
                      </td>
                      <td className="px-6 py-3 w-80">
                        <div className="grid grid-cols-3 gap-1 text-center font-bold items-center justify-start">
                          <div className="bg-gray-900 rounded-md">
                            <h1 className="rounded-full text-[10px] bg-gray-800">nodes</h1>
                            <span className="text-[10px]">{node.is_active}</span>
                          </div>
                          <div className="bg-gray-900 rounded-md">
                            <h1 className="rounded-full text-[10px] bg-gray-800">queries</h1>
                            <span className="text-[10px]">{node.last_checkin}</span>
                          </div>
                          <div className="bg-gray-900 rounded-md">
                            <h1 className="rounded-full text-[10px] bg-gray-800">files</h1>
                            <span className="text-[10px]">{node.last_ip}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="gap-2 btn-group">
                          {canAccess('team_fleet_node', ['delete']) && (
                            <Button
                              className="dark:text-gray-100"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openDeleteModal(node.id);
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
          <DeleteNode
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            nodeId={nodeToDelete!}
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

export default Nodes;
