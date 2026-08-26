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
import { Error, Loading } from '@/components/shared';
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
import { ChevronRight } from 'lucide-react';

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
  if (isError) return <Error />;

  const openDeleteModal = (id: string) => {
    setPackToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = (pack: Pack) => {
    setPackToEdit({ ...pack });
    setEditVisible(true);
  };

  return (
    <>
      {user ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold leading-none tracking-tight">
                {t('fleet:fleet-all-packs')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('fleet:fleet-pack-listed')}
              </p>
            </div>

            {canAccess('team_fleet_pack', ['create']) && (
              <Button size="sm" onClick={() => setVisible(true)}>
                {t('create')}
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {packs && packs.length > 0 ? (
                  packs.map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell>
                        <Link
                          href={`/teams/${slug}/asset-management/packs/${pack.id}`}
                          className="group inline-flex items-center gap-1.5 rounded-sm px-1 py-0.5 -mx-1 -my-0.5 text-foreground transition-colors hover:text-primary"
                        >
                          <span className="font-medium underline-offset-4 group-hover:underline">
                            {pack.name}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canAccess('team_fleet_pack', ['update']) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(pack)}
                            >
                              {t('edit-task')}
                            </Button>
                          )}
                          {canAccess('team_fleet_pack', ['delete']) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteModal(pack.id)}
                            >
                              {t('delete')}
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
                      className="text-center py-4 text-sm text-muted-foreground"
                    >
                      {t('no-packs-found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
        </div>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </>
  );
};

export default Packs;
