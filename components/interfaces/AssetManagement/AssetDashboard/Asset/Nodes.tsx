import { useMemo, useState } from 'react';
import Link from 'next/link';
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
  'px-3 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide';

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

  const filteredNodes = useMemo(
    () =>
      nodes?.filter((node) => {
        try {
          return (
            node.team?.user?.name?.toLowerCase().includes(searchTerm) ||
            node.node_key?.toLowerCase().includes(searchTerm)
          );
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
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium">
                {t('fleet:fleet-all-assets')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('fleet:fleet-asset-listed')}
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t('fleet:search-asset-placeholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-9 w-64 md:h-8"
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
              {/* Mobile/tablet: stacked cards (Direction B mobile-first — avoids an unreadable 6-column horizontal scroll below md:) */}
              <div className="grid gap-2 md:hidden">
                {pagedNodes.map((node) => (
                  <div
                    key={node.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/teams/${slug}/assets/${node.id}`}
                        title={t('open-asset-details')}
                        className="group inline-flex items-start gap-1.5 min-w-0 text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                      >
                        <div className="min-w-0">
                          <div className="font-medium underline-offset-4 group-hover:underline truncate">
                            {node.owner.user?.firstname}{' '}
                            {node.owner.user?.lastname}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {node.owner.user?.email}
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                      <AssetStatusBadge isActive={node.is_active} />
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {t('system-info')}
                        </dt>
                        <dd>{node.node_info?.system_info?.computer_name}</dd>
                        <dd>{node.node_info?.system_info?.hardware_model}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {t('enrolled-on')}
                        </dt>
                        <dd>
                          <FormattedDate
                            style={'text-xs'}
                            dateString={node.enrolled_on}
                          />
                        </dd>
                      </div>
                    </dl>

                    {canAccess('team_fleet_node', ['delete']) && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(node.id)}
                        >
                          {t('delete')}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: full table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="text-sm w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
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
                      <tr key={node.id}>
                        <td className="px-3 py-3 align-top">
                          <Link
                            href={`/teams/${slug}/assets/${node.id}`}
                            title={t('open-asset-details')}
                            className="group inline-flex items-start gap-1.5 rounded-sm px-1 py-0.5 -mx-1 -my-0.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <div className="min-w-0">
                              <div className="font-medium underline-offset-4 group-hover:underline">
                                {node.owner.user?.firstname}{' '}
                                {node.owner.user?.lastname}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {node.owner.user?.email}
                              </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </Link>
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
                            {node.node_info?.osquery_info?.instance_id || 'N/A'}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top text-xs">
                          <div>
                            {node.node_info?.system_info?.computer_name}
                          </div>
                          <div>
                            {node.node_info?.system_info?.hardware_model}
                          </div>
                          <div>
                            {t('hardware-serial')}:{' '}
                            {node.node_info?.system_info.hardware_serial}
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
                                onClick={() => openDeleteModal(node.id)}
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
