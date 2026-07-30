import { useCallback, useState } from 'react';

type PlanCheckState = {
  slug?: string;
  hasPlan?: boolean;
};

const useHasPlan = () => {
  const [planCheck, setPlanCheck] = useState<PlanCheckState>({});

  const hasPlan = useCallback(async (slug: string): Promise<boolean> => {
    setPlanCheck({ slug });

    try {
      const response = await fetch('/api/check-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        setPlanCheck({ slug, hasPlan: false });
        return false;
      }

      const data = await response.json();

      setPlanCheck({ slug, hasPlan: data.hasPlan });
      return data.hasPlan;
    } catch {
      setPlanCheck({ slug, hasPlan: false });
      return false;
    }
  }, []);

  return {
    hasPlan,
    checkedHasPlan: planCheck.hasPlan,
    checkedPlanSlug: planCheck.slug,
  };
};

export default useHasPlan;
