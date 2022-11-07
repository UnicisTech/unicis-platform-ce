import type { User } from "next-auth";

import type { TeamMember } from "@prisma/client";

export const isTeamOwner = (user: User, members: TeamMember[]) => {
  const owner = members.filter(
    (member) => member.userId === user.id && member.role === "owner"
  );

  return owner.length > 0;
};

export const tiaNavigations = (slug: string, activeTab: string) => {
  return [
    {
      name: "Overview",
      href: `/privacy/tia/${slug}/overview`,
      active: activeTab === "overview",
    },
    {
      name: "Transfer Impact Assessment",
      href: `/privacy/tia/${slug}/tia`,
      active: activeTab === "assessment",
    },
  ];
};
