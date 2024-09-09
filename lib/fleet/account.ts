

export const accountNavigations = (activeTab: string) => {
  return [
    {
      name: 'Connect',
      active: activeTab === 'Connect',
    },
    {
      name: 'Webhook',
      active: activeTab === 'Webhook',
    },
  ];
};