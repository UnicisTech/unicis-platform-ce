import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import {
  Error,
  LetterAvatar,
  Loading,
  ManagementCard,
  ManagementCardContent,
  ManagementCardHeader,
} from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import type { Invitation, Team } from 'types';
import useInvitations from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';

const PendingInvitations = ({ team }: { team: Team }) => {
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { isLoading, isError, invitations, mutateInvitation } = useInvitations(
    team.slug
  );

  const { t } = useTranslation('common');

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!invitations?.length) return null;

  const deleteInvitation = async (invitation: Invitation | null) => {
    if (!invitation) return;

    const sp = new URLSearchParams({ id: invitation.id });

    const response = await fetch(
      `/api/teams/${team.slug}/invitations?${sp.toString()}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    const json = (await response.json()) as ApiResponse<unknown>;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    mutateInvitation();
    toast.success(t('invitation-deleted'));
  };

  const copyInviteLink = async (invitation: Invitation) => {
    const invitationLink = `${window.location.origin}/invitations/${invitation.token}`;

    try {
      await navigator.clipboard.writeText(invitationLink);
      toast.success(t('copied-to-clipboard'));
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error(t('errors.failedToCopyLink'));
    }
  };

  return (
    <>
      <ManagementCard>
        <ManagementCardHeader
          title={t('pending-invitations')}
          description={t('description-invitations')}
        />

        {/* Table */}
        <ManagementCardContent scrollable>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
                <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                  {t('email')}
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                  {t('role')}
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                  {t('expires-at')}
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 text-right">
                  {t('action')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow
                  key={invitation.token}
                  className="border-slate-100 dark:border-slate-700"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <LetterAvatar name={invitation.email} />
                      <span className="text-sm text-slate-900 dark:text-slate-100">
                        {invitation.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {invitation.role}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(invitation.expires).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={t('copy-to-clipboard')}
                        onClick={() => copyInviteLink(invitation)}
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        aria-label={t('remove')}
                        onClick={() => {
                          setSelectedInvitation(invitation);
                          setConfirmationDialogVisible(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ManagementCardContent>
      </ManagementCard>

      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => deleteInvitation(selectedInvitation)}
        title={t('confirm-delete-member-invitation')}
      >
        {t('delete-member-invitation-warning')}
      </ConfirmationDialog>
    </>
  );
};

export default PendingInvitations;
