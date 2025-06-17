import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Error, LetterAvatar, Loading } from '@/components/shared';
import { Team, TeamMember } from '@prisma/client';
import useCanAccess from 'hooks/useCanAccess';
import useTeamMembers from 'hooks/useTeamMembers';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { InviteMember } from '@/components/invitation';
import UpdateMemberRole from './UpdateMemberRole';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';
import { Button } from '../shadcn/ui/button';

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [visible, setVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false);

  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(team.slug);

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!members) return null;

  const removeTeamMember = async (member: TeamMember | null) => {
    if (!member) return;
    const sp = new URLSearchParams({ memberId: member.userId });

    const response = await fetch(`/api/teams/${team.slug}/members?${sp.toString()}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    mutateTeamMembers();
    toast.success(t('member-deleted'));
  };

  const canUpdateRole = (member: TeamMember) =>
    session?.user.id !== member.userId && canAccess('team_member', ['update']);
  const canRemoveMember = (member: TeamMember) =>
    session?.user.id !== member.userId && canAccess('team_member', ['delete']);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">Members</h2>
          <p className="text-sm text-muted-foreground">Team members and their roles.</p>
        </div>
        <Button onClick={() => setVisible(!visible)}>{t('add-member')}</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            {canAccess('team_member', ['delete']) && <TableHead>{t('action')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <LetterAvatar name={member.user.name} />
                  <span>{member.user.name}</span>
                </div>
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                {canUpdateRole(member) ? (
                  <UpdateMemberRole team={team} member={member} />
                ) : (
                  <span>{member.role}</span>
                )}
              </TableCell>
              {canRemoveMember(member) && (
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMember(member);
                      setConfirmationDialogVisible(true);
                    }}
                  >
                    {t('remove')}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => removeTeamMember(selectedMember)}
        title={t('confirm-delete-member')}
      >
        {t('delete-member-warning')}
      </ConfirmationDialog>

      <InviteMember visible={visible} setVisible={setVisible} team={team} />
    </div>
  );
};

export default Members;
