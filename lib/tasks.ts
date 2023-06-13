export const taskNavigations = (activeTab: string) => {
  return [
    {
      name: "Overview",
      active: activeTab === "Overview",
    },
    {
      name: "Processing Activities",
      active: activeTab === "Processing Activities",
    },
    {
      name: "Cybersecurity Controls",
      active: activeTab === "Cybersecurity Controls",
    },
  ];
};

export const taskCommentsNavigations = (activeTab: string) => {
  return [
    {
      name: "Comments",
      active: activeTab === "Comments",
    },
    {
      name: "Audit logs",
      active: activeTab === "Audit logs",
    },
  ];
};
