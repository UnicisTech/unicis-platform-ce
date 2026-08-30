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
import {
  CreatePack,
  DeletePack,
  EditPack,
} from '@/components/interfaces/AssetManagement/Pack';
import { usePacks } from '@/hooks/fleets/packs/usePacks';
import { Pack } from '@/types/fleet';
import FleetStatus from '../Fleet/FleetStatus';
import { Pencil, Trash2 } from 'lucide-react';

const Packs = ({ team, user }: { team: Team; user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToEdit, setPackToEdit] = useState<Pack>({} as Pack);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);

  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(slug);
  const { packs, isLoading, isError } = usePacks(team?.id);

  if (isLoading) return <Loading />;

  const openDeleteModal = (id: string) => {
    setPackToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = (pack: Pack) => {
    setPackToEdit({ ...pack });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user ? (
        <>
          <ManagementCard>
            <ManagementCardHeader
              title={t('fleet:fleet-all-packs')}
              description={t('fleet:fleet-pack-listed')}
              action={
                canAccess('team_fleet_pack', ['create']) && (
                  <Button size="sm" onClick={() => setVisible(true)}>
                    {t('create-pack')}
                  </Button>
                )
              }
            />

            <ManagementCardContent scrollable>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-900">
                    <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('name')}
                    </TableHead>
                    <TableHead className="px-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {packs && packs.length > 0 ? (
                    packs.map((pack) => (
                      <TableRow
                        key={pack.id}
                        className="border-slate-100 dark:border-slate-700"
                      >
                        <TableCell className="px-4 py-3">
                          <Link
                            href={`/teams/${slug}/asset-management/packs/${pack.id}`}
                            className="text-sm font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-300"
                          >
                            {pack.name}
                          </Link>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canAccess('team_fleet_pack', ['update']) && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => openEditModal(pack)}
                                aria-label={t('edit')}
                                title={t('edit')}
                              >
                                <Pencil
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </Button>
                            )}
                            {canAccess('team_fleet_pack', ['delete']) && (
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => openDeleteModal(pack.id)}
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
                        colSpan={2}
                        className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        {t('no-packs-found')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ManagementCardContent>
          </ManagementCard>

          <CreatePack
            user={user}
            fleetTeamId={team.id}
            visible={visible}
            setVisible={setVisible}
          />
          {editVisible && (
            <EditPack
              visible={editVisible}
              setVisible={setEditVisible}
              team={team}
              pack={packToEdit}
              fleetTeamId={team.id}
            />
          )}
          <DeletePack
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            packId={packToDelete!}
            fleetTeamId={team.id}
          />
        </>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </WithLoadingAndError>
  );
};

export default Packs;
