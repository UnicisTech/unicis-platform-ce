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
import useCanAccess from 'hooks/useCanAccess';
import type { Team, User } from '@/generated/client';
import FleetStatus from '../Fleet/FleetStatus';
import CreateDistributor from './CreateDistributor';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';
import DeleteDistributor from './DeleteDistributorResult';
import FormattedDate from '@/components/shared/Date';
import StatusValue from '../StatusValue';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { Trash2 } from 'lucide-react';

const Distributors = ({ team, user }: { team: Team; user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [distributorToDelete, setDistributorToDelete] = useState<null | string>(
    null
  );

  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(slug);

  const { tasks, isLoading, isError } = useDistributors(team?.id);

  if (isLoading) return <Loading />;

  const openDeleteModal = (id: string) => {
    setDistributorToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user ? (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  {t('distributors')}
                </span>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t('fleet:fleet-distributor-discription')}
                </p>
              </div>

              {canAccess('team_fleet_query', ['create']) && (
                <Button size="sm" onClick={() => setVisible(true)}>
                  {t('create-script')}
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-900">
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('sql')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('asset')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('total-results')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('schedule')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('task')}
                    </TableHead>
                    <TableHead className="px-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="border-slate-100 dark:border-slate-700"
                      >
                        <TableCell className="min-w-72 max-w-lg px-4 py-3 align-top">
                          <Link
                            href={`/teams/${slug}/asset-management/distributors/${task.distributed_query.id}`}
                          >
                            <CodeBlock
                              language="sql"
                              shouldWrapLongLines
                              showLineNumbers={false}
                              text={task.distributed_query.sql}
                            />
                          </Link>
                        </TableCell>

                        <TableCell className="min-w-48 break-all px-4 py-3 align-top text-sm text-slate-600 dark:text-slate-300">
                          {task.node.node_key}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 align-top text-sm text-slate-600 dark:text-slate-300">
                          {task.distributed_query.total_results}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 align-top text-sm text-slate-600 dark:text-slate-300">
                          {task.distributed_query.not_before ? (
                            <FormattedDate
                              style="text-sm text-slate-600 dark:text-slate-300"
                              dateString={task.distributed_query.not_before}
                            />
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              {t('fleet:fleet-null')}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="px-4 py-3 align-top">
                          <div className="grid grid-cols-1 gap-2 text-xs text-slate-900 dark:text-slate-100">
                            <div>
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {t('status')}
                              </p>
                              <StatusValue status={task.status} />
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {t('fleet:fleet-timestamp')}
                              </p>
                              {task.timestamp ? (
                                <FormattedDate
                                  style="text-sm"
                                  dateString={task.timestamp}
                                />
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400">
                                  {t('fleet:fleet-null')}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right align-top">
                          <div className="flex justify-end gap-2">
                            {canAccess('team_fleet_query', ['delete']) && (
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() =>
                                  openDeleteModal(task.distributed_query.id)
                                }
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
                        {t('no-distributors-found')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <CreateDistributor
            user={user}
            fleetTeamId={team.id}
            visible={visible}
            setVisible={setVisible}
          />
          <DeleteDistributor
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            distributorId={distributorToDelete!}
            fleetTeamId={team.id}
          />
        </>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </WithLoadingAndError>
  );
};

export default Distributors;
