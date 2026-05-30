import { useState } from 'react';

const useHasPlan = () => {
  const [checkedHasPlan, setCheckedHasPlan] = useState<boolean>();

  const hasPlan = async (slug: string): Promise<boolean> => {
    try {

      const response = await fetch("/api/check-plan", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      setCheckedHasPlan(data.hasPlan);
      return data.hasPlan;
    } catch (error) {
      return false;
    }
  };

  return {
    hasPlan,
    checkedHasPlan
  };
};


export default useHasPlan;
