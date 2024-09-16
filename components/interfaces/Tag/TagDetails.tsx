import { useCallback, useState } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import Form, { FormFooter } from '@atlaskit/form';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
import toast from 'react-hot-toast';
import DeleteTag from './DeleteTag';
import { useGetTagId } from '@/hooks/fleets/Tags/useGetTagId';

interface FormData {
  values
}

interface Option {
  label: string;
  value: string;
}
const TagDetails = ({ fleetTeamId, tagID, user }: { fleetTeamId: string, user: Partial<User>, tagID: string }) => {  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updateTag = useUpdatePack();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<null | string>(null);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  
  const { tag, isLoading, isError } = useGetTagId(fleetTeamId, tagID, user?.fleetAccessPhrase!);

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
    <IssuePanelContainer>
      <Form<FormData>
        onSubmit={async (data) => {
          const { values } = data;
          const tagData = {values};
          try {
            await updateTag(fleetTeamId, tagData, tagID, user.fleetAccessPhrase!);
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
              ...

              <FormFooter>
                {canAccess('team_fleet_tag', ['update']) && (
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
                {canAccess('team_fleet_tag', ['delete']) && (
                  <Button
                    className="dark:text-gray-100"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      openDeleteModal(tag?.id!);
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
      <DeleteTag
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        tagId={tagToDelete!}
        fleetTeamId={fleetTeamId}
        fleetAccessPhrase={user.fleetAccessPhrase!}
      />
    </IssuePanelContainer>
  );
};

export default TagDetails;
