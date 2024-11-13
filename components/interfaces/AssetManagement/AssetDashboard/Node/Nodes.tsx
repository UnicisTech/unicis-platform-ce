import { useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';
import type { Team, User } from '@prisma/client';
import FleetStatus from '../../Fleet/FleetStatus';
import FormattedDate from '@/components/shared/Date';
import DeleteNode from './DeleteNode';
import ExportNode from './ExportNode';
import TextField from '@atlaskit/textfield';
import AddAsset from './AddAsset';
import { Node } from 'types'


const Nodes = ({ team, user, nodes, setStatus, status }: { team: Team, user: Partial<User>, nodes: Node[], setStatus: (status: string) => void, status: string }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);
  const [exportVisible, setExportVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [nodeToExport, setNodeToExport] = useState<null | string>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const openDeleteModal = async (id: string) => {
    setNodeToDelete(id);
    setDeleteVisible(true);
  };

  const openExportModal = async (id: string) => {
    setNodeToExport(id);
    setExportVisible(true);
  };

  const filteredNodes = nodes?.filter(node =>
    node.team.user.name.toLowerCase().includes(searchTerm) ||
    node.node_key.toLowerCase().includes(searchTerm)
  );

  return (
    <>
      {user != null ?
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('fleet-all-assets')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('fleet-asset-listed')}
              </p>
            </div>

            <div className='w-fit gap-2 flex'>
              <TextField
                type="text"
                placeholder="Search by name or asset"
                height={50}
                autoComplete="off"
                value={searchTerm}
                onChange={handleSearchChange}
                className='h-8 m-0'
              />
              {/* <AssetsSortDropdown setStatus={setStatus} canAccess={canAccess} t={t}/> */}
              {canAccess('team_fleet_node', ['read']) && (
                <Button
                  size="xs"
                  color="neutral"
                  disabled={status === 'inactive'}
                  variant="outline"
                  onClick={() => {
                    setStatus('inactive');
                  }}
                >
                  {t('inactive-assets')}
                </Button>
              )}

              {canAccess('team_fleet_node', ['read']) && (
                <Button
                  size="xs"
                  color="neutral"
                  disabled={status === 'active'}
                  variant="outline"
                  onClick={() => {
                    setStatus('active');
                  }}
                >
                  {t('active-assets')}
                </Button>
              )}
              {canAccess('team_fleet_node', ['read']) && (
                <Button
                  size="xs"
                  color="neutral"
                  disabled={status === 'all'}
                  variant="outline"
                  onClick={() => {
                    setStatus('all');
                  }}
                >
                  {t('all-assets')}
                </Button>
              )}
              {canAccess('team_fleet_node', ['read']) && (
                <Button
                  size="xs"
                  color="primary"
                  variant="outline"
                  onClick={() => {
                    setAddVisible(true)
                  }}
                >
                  {t('add-asset')}
                </Button>
              )}
            </div>

          </div>
          <div className='overflow-x-auto'>
            <table className="text-sm table w-full border-b dark:border-base-200">
              <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-3 py-3 flex gap-2 items-center">
                    {t('owner')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('status')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('agent-info')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('system-info')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('enrolled-on')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes &&
                  filteredNodes.map((node, index) => {
                    return (
                      <tr key={node.id}>
                        <td className="py-3 align-top">
                          <Link href={`/teams/${slug}/assets/${node.id}`}>
                            <div className="flex items-center justify-start">
                              <span className="">{node.owner.user?.firstname!} {node.owner.user?.lastname[0].toUpperCase()}</span>
                            </div>
                            <span className="">{node.owner.user?.email!}</span>
                          </Link>
                        </td>
                        <td className="py-3 align-top">
                          <Link href={`/teams/${slug}/assets/${node.id}`}>
                            <div className="grid grid-cols-1 gap-1 font-bold justify-start">
                              <div className="rounded-xs">
                                <div className=''>
                                  {node.is_active ?
                                    <div className='w-4 h-4 rounded-full bg-green-500'></div>
                                    :
                                    <div className='w-4 h-4 rounded-full bg-red-500'></div>
                                  }
                                </div>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 align-top">
                          <div className="grid grid-cols-1 gap-1 font-bold justify-start">
                            <div className="rounded-xs">
                              <span className="text-[10px] line-clamp-1 overflow-hidden">PID: {node.node_info?.osquery_info?.pid}</span>
                            </div>
                            <div className="rounded-xs">
                              <span className="text-[10px] line-clamp-1 overflow-hidden">v: {node.node_info?.osquery_info?.version}</span>
                            </div>
                            <div className="rounded-xs">
                              <span className="text-[10px] line-clamp-1 overflow-hidden">{node.node_info?.osquery_info?.instance_id || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 align-top">
                          <div className="grid grid-cols-1 gap-1 font-bold justify-start">
                            <div className="rounded-xs">
                              <span className="text-[10px] line-clamp-1 overflow-hidden">{node.node_info?.system_info?.computer_name}</span>
                            </div>
                            <div className="rounded-xs">
                              <span className="text-[10px] line-clamp-1 overflow-hidden">{node.node_info?.system_info?.hardware_model}</span>
                            </div>
                            <div className="rounded-xs">
                              <span className="text-[10px] line-clamp-1 overflow-hidden">SN: {node.node_info?.system_info.hardware_serial}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 align-top">
                          <div className="grid grid-cols-1 gap-1 font-bold justify-start">
                            <div className="rounded-xs">
                              <FormattedDate style={'text-[10px]'} dateString={node.enrolled_on} />
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
          </div>
          <DeleteNode
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            nodeId={nodeToDelete!}
            fleetTeamId={team.id}
          />
          <ExportNode
            visible={exportVisible}
            setVisible={setExportVisible}
            nodeId={nodeToExport!}
            fleetTeamId={team.id}
          />
          <AddAsset
            visible={addVisible}
            user={user}
            team={team}
            setVisible={setAddVisible}
          />
        </div>
        :
        <>
          <FleetStatus status='disconnected' />
        </>
      }
    </>
  );
};

export default Nodes;
