// components/MemberName.tsx
import React from 'react';

const MemberName = ({
  userId,
  membersById,
  fallback,
}: {
  userId: string | null | undefined;
  membersById: Map<string, string>;
  fallback: string;
}) => {
  if (!userId) return <span>{fallback}</span>;
  const name = membersById.get(userId);
  return <span>{name || fallback}</span>;
}

export default MemberName;
