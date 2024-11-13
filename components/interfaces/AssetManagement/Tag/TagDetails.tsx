import { Fragment, useCallback, useState } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Card, Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import Form, { Field, FormFooter } from '@atlaskit/form';
import toast from 'react-hot-toast';
import DeleteTag from './DeleteTag';
import { useGetTagId } from '@/hooks/fleets/Tags/useGetTagId';
import { useUpdateTag } from '@/hooks/fleets/Tags/useUpdateTag';
import TextField from '@atlaskit/textfield';

interface FormData {
  value
}

const TagDetails = ({ fleetTeamId, tagID, user }: { fleetTeamId: string, user: Partial<User>, tagID: string }) => {  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updateTag = useUpdateTag();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<null | string>(null);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  
  const { tag, isLoading, isError } = useGetTagId(fleetTeamId, tagID);

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
          const { value } = data;
          const tagData = {value};
          try {
            await updateTag(fleetTeamId, tagData, tagID);
          } catch (err) {
            toast.error(t('error'));
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
              <Field
                aria-required={true}
                name="value"
                label="Tag Value"
                defaultValue={tag?.value}
                isRequired
              >
                {({ fieldProps }) => (
                  <Fragment>
                    <TextField {...fieldProps} />
                  </Fragment>
                )}
              </Field>

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
      />

      <Card heading="Packs">
        {tag?.packs.map((pack) =>
          <div key={pack.id} className='rounded mb-2'>
            <p className='text-xl'>{pack.name}</p>
          </div>
        )}
      </Card>

      <Card heading="Queyies">
        {tag?.queries.map((query) =>
          <div key={query.id} className='rounded mb-2'>
            <p className='text-xl'>{query.name}</p>
          </div>
        )}
      </Card>
      
    </IssuePanelContainer>
  );
};

export default TagDetails;
