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
import {
  Loading,
  ManagementCard,
  ManagementCardContent,
  ManagementCardHeader,
  WithLoadingAndError,
} from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { Team, User } from '@/generated/client';
import FleetStatus from '../Fleet/FleetStatus';
import CreateTag from './CreateTag';
import DeleteTag from './DeleteTag';
import EditTag from './EditTag';
import FormattedDate from '@/components/shared/Date';
import { useTags } from '@/hooks/fleets/Tags/useTags';
import { Tag } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

const Tags = ({ team, user }: { team: Team; user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag>({} as Tag);
  const [tagToDelete, setTagToDelete] = useState<null | string>(null);

  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(slug);
  const { tags, isLoading, isError } = useTags(team.id);

  if (isLoading) return <Loading />;

  const openDeleteModal = (id: string) => {
    setTagToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user ? (
        <>
          <ManagementCard>
            <ManagementCardHeader
              title={t('fleet:fleet-all-tags')}
              description={t('fleet:fleet-tag-listed')}
              action={
                canAccess('team_fleet_tag', ['create']) && (
                  <Button size="sm" onClick={() => setVisible(true)}>
                    {t('create-tag')}
                  </Button>
                )
              }
            />

            <ManagementCardContent scrollable>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-900">
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('tag')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('created-at')}
                    </TableHead>
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('analysis')}
                    </TableHead>
                    <TableHead className="px-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {tags && tags.length > 0 ? (
                    tags.map((tag) => (
                      <TableRow
                        key={tag.id}
                        className="border-slate-100 dark:border-slate-700"
                      >
                        <TableCell className="px-4 py-3">
                          <Link
                            href={`/teams/${slug}/asset-management/tags/${tag.id}`}
                            className="text-sm font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-300"
                          >
                            {tag.value}
                          </Link>
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3">
                          <FormattedDate
                            style="text-sm text-slate-600 dark:text-slate-300"
                            dateString={tag.updated_at}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          <div className="grid min-w-64 grid-cols-4 gap-3 text-xs font-semibold text-slate-900 dark:text-slate-100">
                            <div>
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {t('fleet:fleet-assets-label')}
                              </p>
                              <span>{tag.nodes_count}</span>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {t('fleet:fleet-queries-label')}
                              </p>
                              <span>{tag.queries_count}</span>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {t('fleet:fleet-files-label')}
                              </p>
                              <span>{tag.file_paths_count}</span>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {t('packs')}
                              </p>
                              <span>{tag.packs_count}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canAccess('team_fleet_tag', ['update']) && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setTagToEdit(tag);
                                  setEditVisible(true);
                                }}
                                aria-label={t('edit')}
                                title={t('edit')}
                              >
                                <Pencil
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </Button>
                            )}
                            {canAccess('team_fleet_tag', ['delete']) && (
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => openDeleteModal(tag.id)}
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
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        {t('no-tags-found')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ManagementCardContent>
          </ManagementCard>

          <CreateTag
            user={user}
            fleetTeamId={team.id}
            visible={visible}
            setVisible={setVisible}
          />
          <DeleteTag
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            tagId={tagToDelete!}
            fleetTeamId={team.id}
          />
          {editVisible && (
            <EditTag
              visible={editVisible}
              setVisible={setEditVisible}
              tag={tagToEdit}
              fleetTeamId={team.id}
            />
          )}
        </>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </WithLoadingAndError>
  );
};

export default Tags;
