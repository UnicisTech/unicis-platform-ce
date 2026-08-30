import { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';
import type { Team, User } from '@/generated/client';
import FleetStatus from '../../Fleet/FleetStatus';
import FormattedDate from '@/components/shared/Date';
import DeleteNode from './DeleteNode';
import AddAsset from './AddAsset';
import { Node } from 'types';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { ChevronRight } from 'lucide-react';
import AssetStatusBadge from '@/components/shared/AssetStatusBadge';

const PAGE_SIZE = 20;

const thClassName =
  'whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400';

const getNodeDisplayName = (node: Node) =>
  node.node_info?.system_info?.computer_name ||
  node.node_info?.system_info?.hostname ||
  node.node_info?.system_info?.local_hostname ||
  node.host_identifier ||
  node.node_key ||
  'N/A';

const getNodeSearchText = (node: Node) =>
  [
    getNodeDisplayName(node),
    node.node_info?.system_info?.hostname,
    node.node_info?.system_info?.local_hostname,
    node.host_identifier,
    node.node_key,
    node.owner.user?.name,
    node.owner.user?.firstname,
    node.owner.user?.lastname,
    node.owner.user?.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

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
  const [addVisible, setAddVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(slug);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
    setPage(1);
  };

  const openDeleteModal = async (id: string) => {
    setNodeToDelete(id);
    setDeleteVisible(true);
  };

  const openNodeDetails = (nodeId: string) => {
    void router.push(`/teams/${slug}/assets/${nodeId}`);
  };

  const filteredNodes = useMemo(
    () =>
      nodes?.filter((node) => {
        try {
          return getNodeSearchText(node).includes(searchTerm);
        } catch {
          return false;
        }
      }) || [],
    [nodes, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredNodes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedNodes = filteredNodes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      {user ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-medium">
                {t('fleet:fleet-all-assets')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('fleet:fleet-asset-listed')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Input
                type="text"
                placeholder={t('fleet:search-asset-placeholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-9 w-full sm:w-48 lg:w-64 md:h-8"
              />

              {['inactive', 'active', 'all'].map((s) =>
                canAccess('team_fleet_node', ['read']) ? (
                  <Button
                    key={s}
                    variant={status === s ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-9 md:h-8"
                    onClick={() => {
                      setStatus(s);
                      setPage(1);
                    }}
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
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className={thClassName}>{t('computer-name')}</th>
                        <th className={thClassName}>{t('owner')}</th>
                        <th className={thClassName}>{t('status')}</th>
                        <th className={thClassName}>{t('agent-info')}</th>
                        <th className={thClassName}>{t('system-info')}</th>
                        <th className={thClassName}>{t('enrolled-on')}</th>
                        <th className={thClassName}>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {pagedNodes.map((node) => (
                        <tr
                          key={node.id}
                          role="link"
                          tabIndex={0}
                          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset hover:bg-slate-50/70 dark:hover:bg-slate-800/70"
                          onClick={() => openNodeDetails(node.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              openNodeDetails(node.id);
                            }
                          }}
                        >
                          <td className="px-3 py-3 align-top">
                            <div className="group inline-flex items-start gap-1.5 rounded-sm px-1 py-0.5 -mx-1 -my-0.5 text-foreground transition-colors hover:text-primary">
                              <div className="min-w-0">
                                <div className="font-medium underline-offset-4 group-hover:underline">
                                  {getNodeDisplayName(node)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {node.host_identifier || 'N/A'}
                                </div>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top text-xs">
                            <div className="font-medium">
                              {node.owner.user?.firstname}{' '}
                              {node.owner.user?.lastname}
                            </div>
                            <div className="text-muted-foreground">
                              {node.owner.user?.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <AssetStatusBadge isActive={node.is_active} />
                          </td>
                          <td className="px-3 py-3 align-top text-xs">
                            <div>
                              {t('pid')}: {node.node_info?.osquery_info?.pid}
                            </div>
                            <div>
                              {t('version')}:{' '}
                              {node.node_info?.osquery_info?.version}
                            </div>
                            <div>
                              {node.node_info?.osquery_info?.instance_id ||
                                'N/A'}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top text-xs">
                            <div>
                              {node.node_info?.system_info?.hardware_model}
                            </div>
                            <div>
                              {t('hardware-serial')}:{' '}
                              {node.node_info?.system_info?.hardware_serial ||
                                'N/A'}
                            </div>
                            <div>
                              {t('host-identifier')}:{' '}
                              {node.host_identifier || 'N/A'}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top text-xs">
                            <FormattedDate
                              style={'text-[10px]'}
                              dateString={node.enrolled_on}
                            />
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex gap-2">
                              {canAccess('team_fleet_node', ['delete']) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openDeleteModal(node.id);
                                  }}
                                >
                                  {t('delete')}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-muted-foreground">
                    {t('fleet:page-of', {
                      page: currentPage,
                      total: totalPages,
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {t('fleet:previous-page')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      {t('fleet:next-page')}
                    </Button>
                  </div>
                </div>
              )}
            </>
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
