import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Error, LetterAvatar, Loading } from '@/components/shared';
import type { Team, TeamMember, TeamMemberWithUserDto } from 'types';
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

type FleetEnrollmentLite = {
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  expiresAt: string | Date;
  sentAt: string | Date;
};

type MemberWithFleet = TeamMember & {
  user: {
    id: string;
    name: string;
    email: string;
    fleetEnrollments?: FleetEnrollmentLite[];
  };
};

const formatUntil = (value: string | Date) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
};

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();
  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(team.slug);
  const [visible, setVisible] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<TeamMemberWithUserDto | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const [enrollLoadingByUserId, setEnrollLoadingByUserId] =
    useState<Record<string, boolean>>({});

  const { isLoading, isError, members, mutateTeamMembers } =
    useTeamMembers(team.slug);

  const typedMembers = members as unknown as MemberWithFleet[] | null;

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!typedMembers) return null;

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

  const getEnrollmentView = (member: MemberWithFleet) => {
    const enrollment = member.user.fleetEnrollments?.[0];

    if (!enrollment) {
      return {
        disabled: false,
        label: t('fleet:fleet-enroll'),
      };
    }

    const nowMs = Date.now();
    const expiresAtMs = new Date(enrollment.expiresAt).getTime();
    const isExpired = expiresAtMs <= nowMs;

    if (enrollment.status === 'COMPLETED') {
      return {
        disabled: false,
        label: t('fleet:fleet-revoke-access'),
        isRevoke: true,
      };
    }

    if (enrollment.status === 'PENDING' && !isExpired) {
      return {
        disabled: true,
        label: t('fleet:fleet-invite-sent-label'),
      };
    }

    // PENDING but expired, or other status
    return {
      disabled: false,
      label: t('fleet:fleet-resend-invite'),
    };
  };

  const handleRevokeFleetAccess = async (member: MemberWithFleet) => {
    try {
      setEnrollLoadingByUserId((p) => ({
        ...p,
        [member.userId]: true,
      }));

      const res = await fetch('/api/fleet/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.userId,
          teamId: team.id,
        }),
      });

      if (!res.ok) {
        toast.error(t('fleet:fleet-revoke-failed'));
        return;
      }

      toast.success(t('fleet:fleet-access-revoked', { email: member.user.email }));
      mutateTeamMembers();
    } catch {
      toast.error(t('fleet:fleet-revoke-failed'));
    } finally {
      setEnrollLoadingByUserId((p) => ({
        ...p,
        [member.userId]: false,
      }));
    }
  };

  const handleEnrollFleet = async (member: MemberWithFleet) => {
    try {
      setEnrollLoadingByUserId((p) => ({
        ...p,
        [member.userId]: true,
      }));

      const res = await fetch('/api/fleet/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: member.user.email,
          teamId: team.id,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const code = data?.error;

        if (code === 'ALREADY_SENT') {
          const until = data?.expiresAt
            ? formatUntil(data.expiresAt)
            : '';

          toast.error(
            until
              ? t('fleet:fleet-invite-valid-until', { date: until })
              : t('fleet:fleet-invite-already-sent')
          );

          mutateTeamMembers();
          return;
        }

        if (code === 'ALREADY_ENROLLED') {
          toast.error(t('fleet:fleet-already-enrolled'));
          mutateTeamMembers();
          return;
        }

        toast.error(t('fleet:fleet-invite-failed'));
        return;
      }

      toast.success(
        t('fleet:fleet-invite-sent', { email: member.user.email })
      );

      mutateTeamMembers();
    } catch {
      toast.error(t('fleet:fleet-invite-failed'));
    } finally {
      setEnrollLoadingByUserId((p) => ({
        ...p,
        [member.userId]: false,
      }));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('members')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('members-description')}
          </p>
        </div>
        <Button onClick={() => setVisible(!visible)}>
          {t('add-member')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            {canAccess('team_member', ['delete']) && (
              <TableHead className="text-right">{t('actions')}</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {typedMembers.map((member) => {
            const enrollView = getEnrollmentView(member);
            const isEnrollLoading =
              !!enrollLoadingByUserId[member.userId];

            return (
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

                <TableCell className="w-[240px]">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant={enrollView.isRevoke ? "destructive" : "outline"}
                      size="sm"
                      disabled={
                        enrollView.disabled || isEnrollLoading
                      }
                      onClick={() =>
                        enrollView.isRevoke
                          ? handleRevokeFleetAccess(member)
                          : handleEnrollFleet(member)
                      }
                    >
                      {isEnrollLoading
                        ? t('fleet:fleet-sending')
                        : enrollView.label}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!canRemoveMember(member)}
                      onClick={() => {
                        setSelectedMember(member);
                        setConfirmationDialogVisible(true);
                      }}
                    >
                      {t('remove')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
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

      <InviteMember
        visible={visible}
        setVisible={setVisible}
        team={team}
      />
    </div>
  );
};

export default Members;
