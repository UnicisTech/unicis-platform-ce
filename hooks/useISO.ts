import { getAxiosError } from '@/lib/common';
import axios from 'axios';
import type { Team } from '@prisma/client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import type { ApiResponse } from 'types';

const useISO = (team: any) => {
  const [ISO, setISO] = useState(null);
  const { t } = useTranslation('common');

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
          const response = await axios.get<ApiResponse<Team>>(
            `/api/teams/${team.slug}/csc/iso`
          );

          const { data: iso } = response.data;
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
