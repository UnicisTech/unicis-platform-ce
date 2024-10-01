import { Fragment, useCallback, useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import FleetStatus from '../Fleet/FleetStatus';
import { useGetPackId } from '@/hooks/fleets/packs/useGetPackId';
import { IssuePanelContainer } from '@/sharedStyles';
import { ValueType } from '@atlaskit/select';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
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

const PackTags = ({ fleetTeamId, packID, user }: { fleetTeamId: string, user: Partial<User>, packID: string }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updatePack = useUpdatePack();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);

  const { pack, isLoading, isError } = useGetPackId(fleetTeamId!, packID, user.fleetAccessPhrase!);

  if (isLoading) {
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
      <div>
        <TagGroup alignment="start">
          {pack?.tags.map((tag) => (
            <Tag key={tag.id} text={`${tag.value}`} href={`/teams/${slug}/tags/${tag.id}`} />
          ))}
        </TagGroup>
      </div>
    </IssuePanelContainer>
  );
};

export default PackTags;
