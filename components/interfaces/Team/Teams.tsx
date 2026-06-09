import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Error, LetterAvatar, Loading } from '@/components/shared';
import useTeams from 'hooks/useTeams';
import type { Team } from 'types';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';

const Teams = () => {
  const { isLoading, isError, teams, mutateTeams } = useTeams();
  const { t } = useTranslation('common');
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const leaveTeam = async (team: Team) => {
    const res = await fetch(`/api/teams/${team.slug}/members`, {
      method: 'PUT',
    });

    const { error } = await res.json();
    if (!res.ok || error) {
      toast.error(error?.message || t('errors.requestFailed'));
      return;
    }

    toast.success(t('leave-team-success'));
    mutateTeams();
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {t('your-teams')}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {teams &&
              teams.map((team) => {
                return (
                  <tr
                    key={team.id}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
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
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          leaveTeam(team);
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
      </div>
    </div>
  );
};

export default Teams;
