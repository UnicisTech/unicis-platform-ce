
export const queryNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
  ];
};