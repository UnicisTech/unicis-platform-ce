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
import ExportNode from './ExportNode';



const Nodes = ({ team, user }: { team: Team, user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);
  const [exportVisible, setExportVisible] = useState(false);
  const [nodeToExport, setNodeToExport] = useState<null | string>(null);
  
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

  const openExportModal = async (id: string) => {
    setNodeToExport(id);
    setExportVisible(true);
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

            <div className='w-fit gap-2 flex'>
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
              {canAccess('team_fleet_node', ['read']) && (
                <Button
                  size="sm"
                  color="primary"
                  variant="outline"
                  onClick={() => {
                    setStatus('all');
                  }}
                >
                  {t('all-nodes')}
                </Button>
              )}
            </div>

          </div>
          <table className="text-sm table w-full border-b dark:border-base-200">
            <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-3 py-3">
                  {t('index')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('node-model')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('osquery-info')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('system-info')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('platform-info')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {nodes &&
                nodes.map((node) => {
                  return (
                    <tr key={node.id}>
                      <td className="px-6 py-3 align-top">
                        <Link href={`/teams/${slug}/asset-management/nodes/${node.id}`}>
                          <div className="flex items-center justify-start">
                            <span className="underline">{node.index}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="w-[25%] py-3 align-top">
                        <Link href={`/teams/${slug}/asset-management/nodes/${node.id}`}>
                          <div className="grid grid-cols-1 gap-1 text-center font-bold items-center justify-start">
                            <div className="bg-gray-700 rounded-xs">
                              <h1 className="rounded-xs text-[10px] bg-gray-600">Active</h1>
                              <div className='grid justify-center p-1'>
                                {node.is_active ?
                                <div className='p-1.5 rounded-full bg-green-500'></div>
                                :
                                <div className='p-1.5 rounded-full bg-red-500'></div>
                                }
                              </div>
                            </div>
                            <div className="bg-gray-700 rounded-xs">
                              <h1 className="rounded-xs text-[10px] bg-gray-600">Enroll On</h1>
                              <FormattedDate style={'text-[10px]'}  dateString={node.enrolled_on} />
                            </div>
                            <div className="bg-gray-700 rounded-xs">
                              <h1 className="rounded-xs text-[10px] bg-gray-600">Last IP</h1>
                              <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.last_ip}</span>
                            </div>
                            <div className="bg-gray-700 rounded-xs">
                              <h1 className="rounded-xs text-[10px] bg-gray-600">Check In</h1>
                              <FormattedDate style={'text-[10px]'}  dateString={node.last_checkin} />
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 w-[25%] align-top">
                        <div className="grid grid-cols-1 gap-1 text-center font-bold items-center justify-start">
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">PID</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.osquery_info?.pid}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Version</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.osquery_info?.version}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Instance ID</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.osquery_info?.instance_id || "N/A"}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Start Time</h1>
                            <FormattedDate style={'text-[10px]'}  dateString={node.node_info?.osquery_info?.start_time} />
                          </div>
                        </div>
                      </td>
                      <td className="w-[25%] py-3 align-top">
                        <div className="grid grid-cols-1 gap-1 text-center font-bold items-center justify-start">
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Computer Name</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.system_info?.computer_name}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Hardware Model</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.system_info?.hardware_model}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">CPU Brand</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.system_info?.cpu_brand}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Board Model</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.system_info.board_model}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 w-[25%] align-top">
                        <div className="grid grid-cols-1 gap-1 text-center font-bold items-center justify-start">
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Address</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.platform_info?.address}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Size</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.platform_info?.size}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Firmware Type</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.platform_info?.firmware_type}</span>
                          </div>
                          <div className="bg-gray-700 rounded-xs">
                            <h1 className="rounded-xs text-[10px] bg-gray-600">Vendor</h1>
                            <span className="text-[10px] line-clamp-1 px-2 overflow-hidden">{node.node_info?.platform_info?.vendor}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 align-top">
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
                          {canAccess('team_fleet_node', ['delete']) && (
                            <Button
                              className="dark:text-gray-100"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openExportModal(node.id);
                              }}
                            >
                              {t('export')}
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
          <ExportNode
            visible={exportVisible}
            setVisible={setExportVisible}
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
