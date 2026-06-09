import { CreateDirectory, Directory } from '@/components/directorySync';
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
import { toast } from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';
import { isAllowed } from 'models/user';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { Button } from '@/components/shadcn/ui/button';
import { getTeamAccess } from '@/lib/teams';

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
    return <Error message={t('errors.teamNotFound')} />;
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
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            {t('directory-sync')}
          </span>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('provision')}</p>
            {directory ? (
              <Button
                variant="destructive"
                onClick={() => setConfirmationDialogVisible(true)}
              >
                {t('remove')}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setVisible(true)}>
                {t('configure')}
              </Button>
            )}
          </div>
          <Directory team={team} />
        </div>
      </div>
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

  const access = await getTeamAccess(req, res, query);

  if (!access || !access.teamFeatures.dsync) {
    return {
      notFound: true,
    };
  }

  const { teamMember, teamFeatures } = access;
  const baseProps = {
    ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    teamFeatures,
  };

  if (!isAllowed(teamMember.role, 'team_dsync', 'read')) {
    return {
      props: {
        ...baseProps,
        error: {
          message: 'You are not allowed to perform read on team_dsync',
        },
      },
    };
  }

  return {
    props: {
      ...baseProps,
      error: null,
    },
  };
}

export default DirectorySync;
