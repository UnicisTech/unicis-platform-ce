import { getAxiosError } from '@/lib/common';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse, ISO } from 'types';

type IsoApiResponse = {
  iso: ISO;
};

const useISO = (team: any) => {
  const [ISO, setISO] = useState<ISO | null>(null);

  useEffect(() => {
    const asyncEffect = async () => {
      console.log('useISO async effect', team);
      if (!team) {
        return;
      }
      const iso = team?.properties?.csc_iso;
      if (iso) {
        setISO(iso);
      } else {
        try {
          const response = await axios.get<ApiResponse<IsoApiResponse>>(
            `/api/teams/${team.slug}/csc/iso`
          );

          const iso = response.data.data.iso;

          if (iso) {
            setISO(iso);
          }
        } catch (error) {
          toast.error(getAxiosError(error));
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
