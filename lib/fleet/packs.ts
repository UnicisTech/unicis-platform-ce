

export const packNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    }
  ];
};