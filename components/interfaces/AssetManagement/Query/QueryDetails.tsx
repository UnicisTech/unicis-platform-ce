import { Fragment, useCallback, useState } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Error, Loading, PlatformBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { PLATFORMS } from '@/lib/fleet/constants';
import { IssuePanelContainer, WithoutRing } from '@/sharedStyles';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import Select, { ValueType } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import toast from 'react-hot-toast';
import DeleteQuery from './DeleteQuery';
import { useGetQueryId } from '@/hooks/fleets/querys/useGetQueryId';
import { useUpdateQuery } from '@/hooks/fleets/querys/useUpdateQuery';

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

const QueryDetails = ({ user, queryID, fleetTeamId }: { user: Partial<User>, queryID: string, fleetTeamId: string }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updateQuery = useUpdateQuery();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  

  const { query, isLoading, isError } = useGetQueryId(fleetTeamId, queryID, user.fleetAccessPhrase!);

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
    setQueryToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <IssuePanelContainer>
      <div>
        {query?.packs?.length}
      </div>
      <DeleteQuery
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        queryId={queryToDelete!}
        fleetTeamId={fleetTeamId!}
        fleetAccessPhrase={user.fleetAccessPhrase!}
      />
    </IssuePanelContainer>
  );
};

export default QueryDetails;
