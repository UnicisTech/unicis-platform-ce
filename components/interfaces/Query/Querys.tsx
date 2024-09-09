import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading, PlatformBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, FleetSecret as FSType, FleetAccount } from '@prisma/client';
import { CreatePack, DeletePack, EditPack } from '@/components/interfaces/Pack';
import { usePacks } from '@/hooks/fleets/packs/usePack';
import { Pack } from '@/types/fleet';
import { PLATFORMS } from '@/lib/fleet/constants';
import { getFleetSecret } from '@/hooks/fleets/useFleetSecret';
import FleetStatus from '../Fleet/FleetStatus';



const Querys = ({ team, fleetAccount }: { team: Team, fleetAccount: Partial<FleetAccount> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToEdit, setQueryToEdit] = useState<Pack>({} as Pack);
  const [queryToDelete, setQueryToDelete] = useState<null | number>(null);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [fleetTeam, setfleetTeam] = useState<Partial<FSType> | null>(null);
  const [secretLoading, setIsLoading] = useState(true);
  const [secretError, setIsError] = useState<string | null>(null);
  
  
  useEffect(() => {
    const fetchSecret = async () => {
      try {
        const secret = await getFleetSecret(team.id);
        setfleetTeam(secret);
      } catch (error) {
        setIsError('error.message');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSecret();
  }, [team.id]);

  const { packs, isLoading, isError } = usePacks(fleetTeam?.fleetTeamId || '', fleetAccount?.accessPhrase!);

  if (isLoading || secretLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <FleetStatus />
        {/* <Error /> */}
      </>
    );
  }

  const openDeleteModal = async (id: number) => {
    setQueryToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = async (pack: Pack) => {
    setQueryToEdit({ ...pack });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {fleetAccount ?
        <div className="space-y-3">
          
        </div>
        :
        <>
          <FleetStatus status='disconnected'/>
        </>
      }
    </WithLoadingAndError>
  );
};

export default Querys;
