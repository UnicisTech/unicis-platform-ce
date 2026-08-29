import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button } from '@/components/shadcn/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Loading, WithLoadingAndError } from '@/components/shared';
import PlatformBadge from '@/components/shared/PlatformBadge';
import useCanAccess from 'hooks/useCanAccess';
import type { Team, User } from '@/generated/client';
import { Query } from '@/types/fleet';
import { formatQueryInterval, PLATFORMS } from '@/lib/fleet/constants';
import FleetStatus from '../Fleet/FleetStatus';
import CreateQuery from './CreateQuery';
import { useQueries } from '@/hooks/fleets/queries/useQueries';
import DeleteQuery from './DeleteQuery';
import EditQuery from './EditQuery';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { Pencil, Trash2 } from 'lucide-react';

const Querys = ({ team, user }: { team: Team; user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToEdit, setQueryToEdit] = useState<Query>({} as Query);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);

  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(slug);
  const { queries, isLoading, isError } = useQueries(team?.id);

  if (isLoading) return <Loading />;

  const openDeleteModal = (id: string) => {
    setQueryToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = (query: Query) => {
    setQueryToEdit({ ...query });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user ? (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  {t('fleet:fleet-all-queries')}
                </span>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t('fleet:fleet-queries-listed')}
                </p>
              </div>

              {canAccess('team_fleet_query', ['create']) && (
                <Button size="sm" onClick={() => setVisible(true)}>
                  {t('fleet:fleet-create-query')}
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-900">
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('name')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('sql')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('platform')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('version')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('interval')}
                    </TableHead>
                    <TableHead className="px-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {queries && queries.length > 0 ? (
                    queries.map((query) => (
                      <TableRow
                        key={query.id}
                        className="border-slate-100 dark:border-slate-700"
                      >
                        <TableCell className="px-4 py-3">
                          <Link
                            href={`/teams/${slug}/asset-management/queries/${query.id}`}
                            className="text-sm font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-300"
                          >
                            {query.name}
                          </Link>
                        </TableCell>

                        <TableCell className="min-w-72 max-w-lg px-4 py-3">
                          <CodeBlock
                            language="sql"
                            showLineNumbers={false}
                            shouldWrapLongLines
                            text={query.sql}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          <PlatformBadge
                            value={query.platform!}
                            label={
                              PLATFORMS.find(
                                ({ value }) => value === query.platform
                              )?.label as string
                            }
                          />
                        </TableCell>

                        <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                          {query.version}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                          {formatQueryInterval(query.interval)}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canAccess('team_fleet_query', ['update']) && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => openEditModal(query)}
                                aria-label={t('edit')}
                                title={t('edit')}
                              >
                                <Pencil
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </Button>
                            )}
                            {canAccess('team_fleet_query', ['delete']) && (
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => openDeleteModal(query.id)}
                                aria-label={t('delete')}
                                title={t('delete')}
                              >
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        {t('fleet:no-queries-found')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <CreateQuery
            user={user}
            fleetTeamId={team.id}
            visible={visible}
            setVisible={setVisible}
          />
          {editVisible && (
            <EditQuery
              visible={editVisible}
              setVisible={setEditVisible}
              team={team}
              query={queryToEdit}
            />
          )}
          <DeleteQuery
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            queryId={queryToDelete!}
            fleetTeamId={team.id}
          />
        </>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </WithLoadingAndError>
  );
};

export default Querys;
