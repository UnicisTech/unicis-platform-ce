import { Fragment, useCallback, useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading, PlatformBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { FleetSecret as FSType, FleetAccount } from '@prisma/client';
import { PLATFORMS } from '@/lib/fleet/constants';
import { getFleetSecret } from '@/hooks/fleets/useFleetSecret';
import FleetStatus from '../Fleet/FleetStatus';
import { useGetPackId } from '@/hooks/fleets/packs/useGetPackId';
import { IssuePanelContainer, WithoutRing } from '@/sharedStyles';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import ReactQuill from 'react-quill';
import Select, { ValueType } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
import toast from 'react-hot-toast';
import Tag from '@atlaskit/tag';
import TagGroup from '@atlaskit/tag-group';


interface FormData {
  name,
  platform: ValueType<Option>,
  version,
  shard,
  description,
  [key: string]: string | ValueType<Option>;
}

interface Option {
  label: string;
  value: string;
}

const PackTags = ({ teamId, fleetAccount, packID }: { teamId: string, fleetAccount: Partial<FleetAccount>, packID: string }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [fleetTeam, setfleetTeam] = useState<Partial<FSType> | null>(null);
  const [secretLoading, setIsLoading] = useState(true);
  const [secretError, setIsError] = useState<string | null>(null);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updatePack = useUpdatePack();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  
  useEffect(() => {
    const fetchSecret = async () => {
      try {
        const secret = await getFleetSecret(teamId);
        setfleetTeam(secret);
      } catch (error) {
        setIsError('error.message');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSecret();
  }, [teamId]);

  const { pack, isLoading, isError } = useGetPackId(fleetTeam?.fleetTeamId!, packID, fleetAccount?.accessPhrase!);

  if (isLoading || secretLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <FleetStatus />
        {/* <Error /> */}
      </>
    );
  }

  const openDeleteModal = async (id: string) => {
    setPackToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <IssuePanelContainer>
      <Form<FormData>
        onSubmit={async (data) => {
          const { name, platform, version, shard, description } = data;
          const packData = {name, platform: platform?.value, version, shard, description};
          try {
            await updatePack(fleetTeam?.fleetTeamId!, packData, packID, fleetAccount.accessPhrase!);
          } catch (err) {
            toast.error(t('error-updating-pack'));
          };
        }}
      >
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                margin: '0 auto',
                flexDirection: 'column',
              }}
            >
              <div>
                <TagGroup alignment="start">
                  {pack?.tags.map((tag) => (
                    <Tag text={`${tag.value}`} removeButtonLabel="Remove" href={`/teams/${slug}/tags/${tag.id}`} />
                  ))}
                </TagGroup>
              </div>
              <FormFooter>
                {canAccess('team_fleet_pack', ['update']) && (
                  <Button
                    color="primary"
                    variant="outline"
                    size="sm"
                    type="submit"
                    active={!isFormChanged}
                    loading={submitting}
                  >
                    {t('save-changes')}
                  </Button>
                )}
                {canAccess('team_fleet_pack', ['delete']) && (
                  <Button
                    className="dark:text-gray-100"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      openDeleteModal(pack?.id!);
                    }}
                  >
                    {t('delete')}
                  </Button>
                )}
              </FormFooter>
            </div>
          </form>
        )}
      </Form>
    </IssuePanelContainer>
  );
};

export default PackTags;
