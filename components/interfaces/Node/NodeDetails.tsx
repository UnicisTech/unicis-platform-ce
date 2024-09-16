import { Fragment, useCallback, useState } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import Form, { Field, FormFooter } from '@atlaskit/form';
import { ValueType } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
import toast from 'react-hot-toast';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';
import DeleteNode from './DeleteNode';

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

const NodeDetails = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [isFormChanged, setIsFormChanged] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);
  const updateNode = useUpdatePack();

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  
  const { node, isLoading, isError } = useGetNodeId(fleetTeamId, nodeID, user?.fleetAccessPhrase!);

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
    setNodeToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <IssuePanelContainer>
      <Form<FormData>
        onSubmit={async (data) => {
          const { name, platform, version, shard, description } = data;
          const packData = {name, platform: platform?.value, version, shard, description};
          try {
            await updateNode(fleetTeamId, packData, nodeID, user.fleetAccessPhrase!);
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
              <Field
                aria-required={true}
                name="name"
                label="Name"
                isRequired
                defaultValue={node?.host_identifier}
              >
                {({ fieldProps }) => (
                  <Fragment>
                    <TextField autoComplete="off" {...fieldProps} />
                  </Fragment>
                )}
              </Field>

              <div className='grid grid-cols-2 gap-2'>
                <Field
                  aria-required={true}
                  name="version"
                  label="Version"
                  isRequired
                  defaultValue={node?.last_checkin}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  aria-required={true}
                  name="shard"
                  label="Shard"
                  isRequired
                  defaultValue={node?.created_at}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
              </div>

              <FormFooter>
                {canAccess('team_fleet_node', ['update']) && (
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
                {canAccess('team_fleet_node', ['delete']) && (
                  <Button
                    className="dark:text-gray-100"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      openDeleteModal(node?.id!);
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
      <DeleteNode
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        nodeId={nodeToDelete!}
        fleetTeamId={fleetTeamId}
        fleetAccessPhrase={user.fleetAccessPhrase!}
      />
    </IssuePanelContainer>
  );
};

export default NodeDetails;
