
export const assetNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
    {
      name: 'Status Logs',
      active: activeTab === 'Status Logs',
    },
    {
      name: 'Result Logs',
      active: activeTab === 'Result Logs',
    },
    {
      name: 'Asset Configurations',
      active: activeTab === 'Asset Configurations',
    },
  ];
};