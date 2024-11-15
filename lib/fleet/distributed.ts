
export const distributorNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
    {
      name: 'Results',
      active: activeTab === 'Results',
    }
  ];
};