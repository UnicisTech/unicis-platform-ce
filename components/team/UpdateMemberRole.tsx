'use client';

import { defaultHeaders } from '@/lib/common';
import { availableRoles } from '@/lib/permissions';
import { Team, TeamMember } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { ApiResponse } from 'types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';

interface UpdateMemberRoleProps {
  team: Team;
  member: TeamMember;
}

const UpdateMemberRole = ({ team, member }: UpdateMemberRoleProps) => {
  const { t } = useTranslation('common');

  const updateRole = async (role: string) => {
    const response = await fetch(`/api/teams/${team.slug}/members`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify({
        memberId: member.userId,
        role,
      }),
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('member-role-updated'));
  };

  return (
    <Select
      defaultValue={member.role}
      onValueChange={(value) => updateRole(value)}
    >
      <SelectTrigger
        className="w-[160px] h-8 text-sm rounded border"
        aria-label="Role"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UpdateMemberRole;
