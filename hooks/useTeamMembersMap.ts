import { useMemo } from 'react';
import useTeamMembers from 'hooks/useTeamMembers';

export default function useTeamMembersMap(slug: string) {
  const { isLoading, isError, members } = useTeamMembers(slug);

  const membersById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members ?? []) {
      if (m?.userId) map.set(m.userId, m.user?.name ?? '');
    }
    return map;
  }, [members]);

  return { isLoading, isError, membersById };
}
