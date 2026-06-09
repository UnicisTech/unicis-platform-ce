import { LetterAvatar } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import type { Team } from 'types';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import CreateTeam from './CreateTeam';
import { Button } from '../shadcn/ui/button';

const Teams = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const [team, setTeam] = useState<Team | null>(null);
  const { isLoading, isError, teams, mutateTeams } = useTeams();
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);

  const { newTeam } = router.query as { newTeam: string };

  const isCreateTeamVisible = useMemo(
    () => Boolean(newTeam) || createTeamVisible,
    [newTeam, createTeamVisible]
  );
  const setCreateTeamOpen = (open: boolean) => {
    setCreateTeamVisible(open);
    if (!open && newTeam) {
      const nextQuery = { ...router.query };
      delete nextQuery.newTeam;
      router.replace(
        { pathname: router.pathname, query: nextQuery },
        undefined,
        {
          shallow: true,
        }
      );
    }
  };

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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('team-listed')}
            </p>
            <Button onClick={() => setCreateTeamOpen(!isCreateTeamVisible)}>
              {t('create-team')}
            </Button>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full min-w-full divide-y divide-slate-100 dark:divide-slate-700 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="w-3/10 px-4 py-2 text-left">{t('name')}</th>
                <th className="w-1/10 px-4 py-2 text-left">{t('members')}</th>
                <th className="w-2/10 px-4 py-2 text-left">{t('plan')}</th>
                <th className="w-2/10 px-4 py-2 text-left">
                  {t('created-at')}
                </th>
                <th className="w-2/10 px-4 py-2 text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
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
                        {(() => {
                          const plan = team.subscription?.plan || 'Community';
                          const planLower = plan.toLowerCase();
                          const planColor =
                            planLower === 'community'
                              ? 'oklch(50.8% .118 165.612)'
                              : planLower === 'premium'
                                ? 'oklch(48.8% .243 264.376)'
                                : planLower === 'ultimate'
                                  ? 'oklch(49.6% .265 301.924)'
                                  : undefined;
                          const customStyle = planColor
                            ? { borderColor: planColor, color: planColor }
                            : undefined;
                          return (
                            <span
                              className={`badge badge-outline uppercase`}
                              style={customStyle}
                            >
                              {plan}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(team.createdAt).toDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setTeam(team);
                            setAskConfirmation(true);
                          }}
                        >
                          {t('leave-team')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          </div>
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
            visible={isCreateTeamVisible}
            setVisible={setCreateTeamOpen}
          />
        </div>
      </WithLoadingAndError>
    </>
  );
};

export default Teams;
