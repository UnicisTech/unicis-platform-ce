import { Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import ConfirmationDialog from '../shared/ConfirmationDialog';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import { Button } from '../shadcn/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../shadcn/ui/card';
import { Loader2 } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle>{t('remove-team')}</CardTitle>
          <CardDescription>{t('remove-team-warning')}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button
            variant="destructive"
            onClick={() => setAskConfirmation(true)}
          >
            {loading && <Loader2 className="animate-spin" />}
            {t('remove-team')}
          </Button>
        </CardFooter>
      </Card>
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
