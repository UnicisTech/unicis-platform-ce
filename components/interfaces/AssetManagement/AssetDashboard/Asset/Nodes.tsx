import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';
import type { Team, User } from '@prisma/client';
import FleetStatus from '../../Fleet/FleetStatus';
import FormattedDate from '@/components/shared/Date';
import DeleteNode from './DeleteNode';
import ExportNode from './ExportNode';
import AddAsset from './AddAsset';
import { Node } from 'types';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { ChevronRight } from 'lucide-react';

const Nodes = ({
  team,
  user,
  nodes,
  setStatus,
  status,
}: {
  team: Team;
  user: Partial<User>;
  nodes: Node[];
  setStatus: (status: string) => void;
  status: string;
}) => {
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

  const filteredNodes = nodes?.filter((node) => {
    try {
      return (
        node.team?.user?.name?.toLowerCase().includes(searchTerm) ||
        node.node_key?.toLowerCase().includes(searchTerm)
      );
    } catch (e) {
      return false;
    }
  }) || [];

  return (
    <>
      {user ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium">{t('fleet-all-assets')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('fleet-asset-listed')}
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t('Search by name or asset')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-8 w-64"
              />

              {['inactive', 'active', 'all'].map((s) =>
                canAccess('team_fleet_node', ['read']) ? (
                  <Button
                    key={s}
                    variant={status === s ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setStatus(s)}
                  >
                    {t(`${s}-assets`)}
                  </Button>
                ) : null
              )}

              {canAccess('team_fleet_node', ['read']) && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setAddVisible(true)}
                >
                  {t('add-asset')}
                </Button>
              )}
            </div>
          </div>

          {filteredNodes && filteredNodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="text-sm w-full border-b">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-3 text-left">{t('owner')}</th>
                    <th className="px-3 py-3 text-left">{t('status')}</th>
                    <th className="px-3 py-3 text-left">{t('agent-info')}</th>
                    <th className="px-3 py-3 text-left">{t('system-info')}</th>
                    <th className="px-3 py-3 text-left">{t('enrolled-on')}</th>
                    <th className="px-3 py-3 text-left">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes?.map((node) => (
                    <tr key={node.id}>
                      <td className="py-3 align-top">
                        <Link
                          href={`/teams/${slug}/assets/${node.id}`}
                          title={t('open-asset-details')}
                          className="group inline-flex items-start gap-1.5 rounded-sm px-1 py-0.5 -mx-1 -my-0.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <div className="min-w-0">
                            <div className="font-medium underline-offset-4 group-hover:underline">
                              {node.owner.user?.firstname}{' '}
                              {node.owner.user?.lastname[0].toUpperCase()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {node.owner.user?.email}
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                      </td>
                      <td className="py-3 align-top">
                        <span className="text-xs font-semibold">
                          {node.is_active ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </td>
                      <td className="py-3 align-top text-xs">
                        <div>
                          PID: {node.node_info?.osquery_info?.pid}
                        </div>
                        <div>
                          v: {node.node_info?.osquery_info?.version}
                        </div>
                        <div>
                          {node.node_info?.osquery_info?.instance_id || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 align-top text-xs">
                        <div>
                          {node.node_info?.system_info?.computer_name}
                        </div>
                        <div>
                          {node.node_info?.system_info?.hardware_model}
                        </div>
                        <div>
                          SN: {node.node_info?.system_info.hardware_serial}
                        </div>
                      </td>
                      <td className="py-3 align-top text-xs">
                        <FormattedDate style={'text-[10px]'} dateString={node.enrolled_on} />
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex gap-2">
                          {canAccess('team_fleet_node', ['delete']) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(node.id)}
                            >
                              {t('delete')}
                            </Button>
                          )}
                          {/* {canAccess('team_fleet_node', ['delete']) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openExportModal(node.id)}
                            >
                              {t('export')}
                            </Button>
                          )} */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">
                {t('no-assets-found')}
              </p>
            </div>
          )}

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
          {addVisible && (
            <AddAsset
              visible={addVisible}
              user={user}
              team={team}
              setVisible={setAddVisible}
            />
          )}
        </div>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </>
  );
};

export default Nodes;
