import { useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, User } from '@prisma/client';
import FleetStatus from '../Fleet/FleetStatus';
import CreateTag from './CreateTag';
import { useTags } from '@/hooks/fleets/Tags/useTags';
import FormattedDate from '@/components/shared/Date';
import DeleteTag from './DeleteTag';



const Tags = ({ team, user }: { team: Team, user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<null | string>(null);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  
  const { tags, isLoading, isError } = useTags(team.fleetTeamId!, user?.fleetAccessPhrase!);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <Error />
      </>
    );
  }

  const openDeleteModal = async (id: string) => {
    setTagToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user.fleetAccessPhrase ?
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('fleet-all-tags')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('fleet-tag-listed')}
              </p>
            </div>

            {canAccess('team_fleet_tag', ['create']) && (
              <Button
                size="sm"
                color="primary"
                variant="outline"
                onClick={() => {
                  setVisible(!visible);
                }}
              >
                {t('create')}
              </Button>
            )}
          </div>
          <table className="text-sm table w-full border-b dark:border-base-200">
            <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  {t('value')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('created_at')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('Analysis')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {tags &&
                tags.map((tag, index) => {
                  return (
                    <tr key={tag.id}>
                      <td className="px-6 py-3">
                        <Link href={`/teams/${slug}/asset-management/tags/${tag.id}`}>
                          <div className="flex items-center justify-start space-x-2">
                            <span className="underline">{tag.value}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-start space-x-2">
                          <FormattedDate style={'text-xs'}  dateString={tag.updated_at} />
                        </div>
                      </td>
                      <td className="px-6 py-3 w-80">
                        <div className="grid grid-cols-4 gap-1 text-center font-bold items-center justify-start">
                          <div className="bg-gray-900 rounded-md">
                            <h1 className="rounded-full text-[10px] bg-gray-800">nodes</h1>
                            <span className="text-[10px]">{tag.nodes_count}</span>
                          </div>
                          <div className="bg-gray-900 rounded-md">
                            <h1 className="rounded-full text-[10px] bg-gray-800">queries</h1>
                            <span className="text-[10px]">{tag.queries_count}</span>
                          </div>
                          <div className="bg-gray-900 rounded-md">
                            <h1 className="rounded-full text-[10px] bg-gray-800">files</h1>
                            <span className="text-[10px]">{tag.file_paths_count}</span>
                          </div>
                          <div className="bg-gray-900 rounded-md">
                            <h1 className="rounded-full text-[10px] bg-gray-800">packs</h1>
                            <span className="text-[10px]">{tag.packs_count}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="gap-2 btn-group">
                          {canAccess('team_fleet_tag', ['delete']) && (
                            <Button
                              className="dark:text-gray-100"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openDeleteModal(tag.id);
                              }}
                            >
                              {t('delete')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <CreateTag user={user} fleetTeamId={team?.fleetTeamId!} visible={visible} setVisible={setVisible}/>
          <DeleteTag
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            tagId={tagToDelete!}
            fleetAccessPhrase={user.fleetAccessPhrase!}
            fleetTeamId={team?.fleetTeamId!}
          />
        </div>
        :
        <>
          <FleetStatus status='disconnected'/>
        </>
      }
    </WithLoadingAndError>
  );
};

export default Tags;
