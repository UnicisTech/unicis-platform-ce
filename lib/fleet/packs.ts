

export const packNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
    {
      name: 'Reports',
      active: activeTab === 'Reports',
    },
  ];
};