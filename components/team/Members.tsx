import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Error, LetterAvatar, Loading } from '@/components/shared';
import type { Team, TeamMemberWithUserDto } from 'types';
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
import { Trash2 } from 'lucide-react';

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);
  const [visible, setVisible] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<TeamMemberWithUserDto | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(
    team.slug
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!members) return null;

  const removeTeamMember = async (member: TeamMemberWithUserDto | null) => {
    if (!member) return;
    const sp = new URLSearchParams({ memberId: member.userId });

    const response = await fetch(
      `/api/teams/${team.slug}/members?${sp.toString()}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    mutateTeamMembers();
    toast.success(t('member-deleted'));
  };

  const canUpdateRole = (member: TeamMemberWithUserDto) =>
    session?.user.id !== member.userId && canAccess('team_member', ['update']);
  const canRemoveMember = (member: TeamMemberWithUserDto) =>
    session?.user.id !== member.userId && canAccess('team_member', ['delete']);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Direction B panel header */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <div>
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              {t('members')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('members-description')}
            </p>
          </div>
          <Button size="sm" onClick={() => setVisible(!visible)}>
            {t('add-member')}
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
                <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                  {t('name')}
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                  {t('email')}
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                  {t('role')}
                </TableHead>
                {canAccess('team_member', ['delete']) && (
                  <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 text-right">
                    {t('actions')}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-slate-100 dark:border-slate-700"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <LetterAvatar name={member.user.name} />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {member.user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {member.user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {canUpdateRole(member) ? (
                      <UpdateMemberRole team={team} member={member} />
                    ) : (
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {member.role}
                      </span>
                    )}
                  </TableCell>
                  {canRemoveMember(member) && (
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setSelectedMember(member);
                          setConfirmationDialogVisible(true);
                        }}
                        aria-label={t('remove')}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => removeTeamMember(selectedMember)}
        title={t('confirm-delete-member')}
      >
        {t('delete-member-warning')}
      </ConfirmationDialog>

      <InviteMember visible={visible} setVisible={setVisible} team={team} />
    </>
  );
};

export default Members;
