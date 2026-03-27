import { getTeamMembers } from 'models/team';

export type NotificationRecipient = {
  id: string;
  email: string;
  name: string;
};

export const getTeamRecipientsBySlug = async (slug: string) => {
  const members = await getTeamMembers(slug);
  const recipients = new Map<string, NotificationRecipient>();

  for (const member of members) {
    const user = member.user;
    if (!user) continue;

    recipients.set(user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
    });
  }

  return Array.from(recipients.values());
};
