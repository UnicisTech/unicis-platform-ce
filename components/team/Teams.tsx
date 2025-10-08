import { LetterAvatar } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { Team } from '@prisma/client';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import useCanAccess from 'hooks/useCanAccess';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import CreateTeam from './CreateTeam';
import DaisyButton from '../shared/daisyUI/DaisyButton';

const Teams = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();

  const [team, setTeam] = useState<Team | null>(null);
  const { isLoading, isError, teams, mutateTeams } = useTeams();
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);

  const { newTeam } = router.query as { newTeam: string };

  useEffect(() => {
    if (newTeam) {
      setCreateTeamVisible(true);
    }
  }, [newTeam]);

  const leaveTeam = async (team: Team) => {
    const response = await fetch(`/api/teams/${team.slug}/members`, {
      method: 'PUT',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('leave-team-success'));
    mutateTeams();
  };

  return (
    <>
      <WithLoadingAndError isLoading={isLoading} error={isError}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('all-teams')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('team-listed')}
              </p>
            </div>
            {canAccess('team', ['create']) && (
              <DaisyButton
                color="primary"
                variant="outline"
                size="md"
                onClick={() => setCreateTeamVisible(!createTeamVisible)}
              >
                {t('create-team')}
              </DaisyButton>
            )}
          </div>
          <table className="w-full min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="w-4/10 px-4 py-2 text-left">{t('name')}</th>
                <th className="w-2/10 px-4 py-2 text-left">{t('members')}</th>
                <th className="w-2/10 px-4 py-2 text-left">
                  {t('created-at')}
                </th>
                <th className="w-2/10 px-4 py-2 text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams &&
                teams.map((team) => {
                  return (
                    <tr key={team.id}>
                      <td className="px-4 py-2">
                        <Link href={`/teams/${team.slug}/dashboard`}>
                          <div className="flex items-center justify-start space-x-2">
                            <LetterAvatar name={team.name} />
                            <span className="underline">{team.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-2">{team._count.members}</td>
                      <td className="px-4 py-2">
                        {new Date(team.createdAt).toDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <DaisyButton
                          variant="outline"
                          size="xs"
                          color="error"
                          onClick={() => {
                            setTeam(team);
                            setAskConfirmation(true);
                          }}
                        >
                          {t('leave-team')}
                        </DaisyButton>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <ConfirmationDialog
            visible={askConfirmation}
            title={`${t('leave-team')} ${team?.name}`}
            onCancel={() => setAskConfirmation(false)}
            onConfirm={() => {
              if (team) {
                leaveTeam(team);
              }
            }}
            confirmText={t('leave-team')}
          >
            {t('leave-team-confirmation')}
          </ConfirmationDialog>
          <CreateTeam
            visible={createTeamVisible}
            setVisible={setCreateTeamVisible}
          />
        </div>
      </WithLoadingAndError>
      {/* {TODO: SHOULD DELETE IT} */}
      {/* <>
      <Card heading={t('all-teams')}>
        <Card.Body>
          <table className="w-full table-fixed text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  {t('name')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('members')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('created-at')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {teams &&
                teams.map((team) => {
                  return (
                    <tr
                      key={team.id}
                      className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 py-3">
                        <Link href={`/teams/${team.slug}/tasks`}>
                          <div className="flex items-center justify-start space-x-2">
                            <LetterAvatar name={team.name} />
                            <span className="underline">{team.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-3">{team._count.members}</td>
                      <td className="px-6 py-3">
                        {new Date(team.createdAt).toDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <DaisyButton
                          variant="outline"
                          size="xs"
                          color="error"
                          onClick={() => {
                            setTeam(team);
                            setAskConfirmation(true);
                          }}
                        >
                          {t('leave-team')}
                        </DaisyButton>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Card.Body>
      </Card>
      <ConfirmationDialog
        visible={askConfirmation}
        title={`${t('leave-team')} ${team?.name}`}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={() => {
          if (team) {
            leaveTeam(team);
          }
        }}
        confirmText={t('leave-team')}
      >
        {t('leave-team-confirmation')}
      </ConfirmationDialog>
    </> */}
    </>
  );
};

export default Teams;
