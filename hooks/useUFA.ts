import { $Enums } from '@prisma/client';

const useUFA = () => {
  const ufa = async (): Promise<string> => {

    try {
      const response = await fetch("/api/ufa-sync", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return '';
      }

      const data = await response.json();
      console.log(data);
      return data.token;
    } catch (error) {
      return '';
    }
  };

  return {
    ufa,
  };
};


export default useUFA;
