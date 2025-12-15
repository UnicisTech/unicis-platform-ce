import { Role, TeamMember } from '@prisma/client';
import type { User } from 'next-auth';

// TODO: move to models/
export const isTeamAdmin = (user: User, members: TeamMember[]) => {
  return (
    members.filter(
      (member) =>
        member.userId === user.id &&
        (member.role === Role.ADMIN || member.role === Role.OWNER)
    ).length > 0
  );
};
