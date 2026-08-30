import type { Team } from 'types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import ConfirmationDialog from '../shared/ConfirmationDialog';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import { Button } from '../shadcn/ui/button';
import { Loader2 } from 'lucide-react';
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardHeader,
} from '@/components/shared';

const RemoveTeam = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [askConfirmation, setAskConfirmation] = useState(false);

  const removeTeam = async () => {
    setLoading(true);

    const response = await fetch(`/api/teams/${team.slug}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    setLoading(false);

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('team-removed-successfully'));
    router.push('/teams');
  };

  return (
    <>
      <ManagementCard className="border-red-200 dark:border-red-800/50">
        <ManagementCardHeader
          title={t('remove-team')}
          description={t('remove-team-warning')}
          className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30"
          titleClassName="text-red-700 dark:text-red-400"
          descriptionClassName="text-red-500"
        />
        <ManagementCardContent className="flex justify-end px-4 py-3">
          <Button
            variant="destructive"
            onClick={() => setAskConfirmation(true)}
          >
            {loading && <Loader2 className="animate-spin" />}
            {t('remove-team')}
          </Button>
        </ManagementCardContent>
      </ManagementCard>
      <ConfirmationDialog
        visible={askConfirmation}
        title={t('remove-team')}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={removeTeam}
      >
        {t('remove-team-confirmation')}
      </ConfirmationDialog>
    </>
  );
};

export default RemoveTeam;
