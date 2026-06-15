import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { ISO, TeamProperties } from 'types';
import { useTranslation } from 'next-i18next';

//TODO: rewrite to SWR
const useISO = (team: any) => {
  const [ISO, setISO] = useState<ISO[] | null>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    const asyncEffect = async () => {
      if (!team) return;

      const iso = (team?.properties as TeamProperties)?.csc_iso;
      if (iso?.length) {
        setISO(iso);
      } else {
        try {
          const res = await fetch(`/api/teams/${team.slug}/csc/iso`);
          if (!res.ok) {
            throw new Error(t('errors.requestFailed'));
          }

          const { data } = await res.json();
          if (data?.iso) {
            setISO(data.iso);
          }
        } catch (error: any) {
          toast.error(error?.message || t('errors.unexpectedError'));
        }
      }
    };

    asyncEffect();
  }, [team, t]);

  return {
    ISO,
  };
};

export default useISO;
