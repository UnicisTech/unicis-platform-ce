const useUFA = () => {
  const ufa = async (): Promise<string> => {
    try {
      const response = await fetch('/api/ufa-sync', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return '';
      }

      const data = await response.json();
      console.log(data);
      return data.token;
    } catch {
      return '';
    }
  };

  return {
    ufa,
  };
};

export default useUFA;
