import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { ISO } from 'types';

const useISO = (team: any) => {
  const [ISO, setISO] = useState<ISO | null>(null);

  useEffect(() => {
    const asyncEffect = async () => {
      if (!team) return;

      const iso = team?.properties?.csc_iso;
      if (iso) {
        setISO(iso);
      } else {
        try {
          const res = await fetch(`/api/teams/${team.slug}/csc/iso`);
          if (!res.ok) {
            throw new Error('Request failed');
          }

          const { data } = await res.json();
          if (data?.iso) {
            setISO(data.iso);
          }
        } catch (error: any) {
          toast.error(error?.message || 'Unexpected error');
        }
      }
    };

    asyncEffect();
  }, [team]);

  return {
    ISO,
  };
};

export default useISO;
