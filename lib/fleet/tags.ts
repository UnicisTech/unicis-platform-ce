
export const tagNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
    {
      name: 'Assets',
      active: activeTab === 'Assets',
    },
    {
      name: 'Queries',
      active: activeTab === 'Queries',
    },
    {
      name: 'Packs',
      active: activeTab === 'Packs',
    },
  ];
};