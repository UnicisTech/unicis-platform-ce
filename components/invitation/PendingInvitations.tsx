import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { Error, LetterAvatar, Loading } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { Invitation, Team } from '@prisma/client';
import useInvitations from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { generateInvitationLink } from '@/lib/email/utils';

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
    const invitationLink = generateInvitationLink(invitation.token);

    try {
      await navigator.clipboard.writeText(invitationLink);
      toast.success(t('copied-to-clipboard'));
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy link to clipboard!');
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <h2 className="text-xl font-medium leading-none tracking-tight">
          {t('pending-invitations')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('description-invitations')}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('expires-at')}</TableHead>
            <TableHead className="text-right">{t('action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.token}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <LetterAvatar name={invitation.email} />
                  <span>{invitation.email}</span>
                </div>
              </TableCell>
              <TableCell>{invitation.role}</TableCell>
              <TableCell>
                {new Date(invitation.expires).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    aria-label="Copy"
                    onClick={() => {
                      copyInviteLink(invitation);
                    }}
                  >
                    {t('copy-to-clipboard')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedInvitation(invitation);
                      setConfirmationDialogVisible(true);
                    }}
                  >
                    {t('remove')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => deleteInvitation(selectedInvitation)}
        title={t('confirm-delete-member-invitation')}
      >
        {t('delete-member-invitation-warning')}
      </ConfirmationDialog>
    </div>
  );
};

export default PendingInvitations;
