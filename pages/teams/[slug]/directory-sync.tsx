import { CreateDirectory, Directory } from '@/components/directorySync';
import { Card } from '@/components/shared';
import { Error, Loading } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { TeamTab } from '@/components/team';
import { defaultHeaders } from '@/lib/common';
import useDirectory from 'hooks/useDirectory';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';
import env from '@/lib/env';
import { getSession } from '@/lib/session';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { inferSSRProps } from '@/lib/inferSSRProps';

const DirectorySync: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ teamFeatures, error }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [visible, setVisible] = useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const { isLoading, isError, team } = useTeam();
  const { directories, mutateDirectory } = useDirectory(slug);
  const { t } = useTranslation('common');

  if (isLoading) {
    return <Loading />;
  }

  if (isError || error) {
    return <Error message={isError?.message || error?.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  const directory =
    directories && directories.length > 0 ? directories[0] : null;

  const removeDirectory = async () => {
    if (!directory) return;

    const sp = new URLSearchParams({ dsyncId: directory.id });

    const response = await fetch(
      `/api/teams/${team.slug}/directory-sync?${sp.toString()}`,
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

    mutateDirectory();
    toast.success(t('directory-sync-deleted'));
  };

  return (
    <>
      <TeamTab
        activeTab="directory-sync"
        team={team}
        teamFeatures={teamFeatures}
      />
      <Card>
        <Card.Body>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">{t('provision')}</p>
            {directory === null ? (
              <Button
                onClick={() => setVisible(!visible)}
                variant="outline"
                color="primary"
                size="md"
              >
                {t('configure')}
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmationDialogVisible(true)}
                variant="outline"
                color="error"
                size="md"
              >
                {t('remove')}
              </Button>
            )}
          </div>
          <Directory team={team} />
        </Card.Body>
      </Card>
      <CreateDirectory visible={visible} setVisible={setVisible} team={team} />
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={removeDirectory}
        title={t('confirm-delete-directory-sync')}
      >
        {t('delete-directory-sync-warning')}
      </ConfirmationDialog>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  if (!env.teamFeatures.dsync) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(req, res);
  const teamMember = await getTeamMember(
    session?.user.id as string,
    query.slug as string
  );

  try {
    throwIfNotAllowed(teamMember, 'team_dsync', 'read');

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: null,
        teamFeatures: env.teamFeatures,
      },
    };
  } catch (error: unknown) {
    const { message } = error as { message: string };

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: {
          message,
        },
        teamFeatures: env.teamFeatures,
      },
    };
  }
}

export default DirectorySync;
