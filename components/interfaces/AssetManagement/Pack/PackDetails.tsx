import { Fragment, useCallback, useState } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { PLATFORMS } from '@/lib/fleet/constants';
import { useGetPackId } from '@/hooks/fleets/packs/useGetPackId';
import { IssuePanelContainer, WithoutRing } from '@/sharedStyles';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import Select, { ValueType } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
import toast from 'react-hot-toast';
import DeletePack from './DeletePack';
import ReactQuill from 'react-quill';

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

const PackDetails = ({ fleetTeamId, packID, user }: { fleetTeamId: string, user: Partial<User>, packID: string }) => {  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updatePack = useUpdatePack();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  
  const { pack, isLoading, isError } = useGetPackId(fleetTeamId, packID, user?.fleetAccessPhrase!);

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
            await updatePack(fleetTeamId, packData, packID, user.fleetAccessPhrase!);
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
                defaultValue={pack?.name}
              >
                {({ fieldProps }) => (
                  <Fragment>
                    <TextField autoComplete="off" {...fieldProps} />
                  </Fragment>
                )}
              </Field>
              
              <Field<ValueType<Option>>
                name="platform"
                label="Platform"
                aria-required={true}
                isRequired
                defaultValue={PLATFORMS.find(
                  ({ value }) => value === pack?.platform
                )}
                validate={async (value) => {
                  if (value) {
                    return undefined;
                  }

                  return new Promise((resolve) =>
                    setTimeout(resolve, 300)
                  ).then(() => 'Please select a platform');
                }}
              >
                {({ fieldProps: { id, ...rest }, error }) => (
                  <Fragment>
                    <WithoutRing>
                      <Select
                        inputId={id}
                        {...rest}
                        options={PLATFORMS}
                        validationState={error ? 'error' : 'default'}
                      />
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </WithoutRing>
                  </Fragment>
                )}
              </Field>

              <div className='grid grid-cols-2 gap-2'>
                <Field
                  aria-required={true}
                  name="version"
                  label="Version"
                  isRequired
                  defaultValue={pack?.version}
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
                  defaultValue={pack?.shard}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
              </div>

              {/* <Field
                label="Description"
                name="description"
                defaultValue={pack?.description}
              >
                {({ fieldProps }: any) => (
                  <Fragment>
                    <ReactQuill
                      theme="snow"
                      {...fieldProps}
                      onChange={(value) => {
                        checkFormChanges();
                        fieldProps.onChange(value);
                      }}
                    />
                  </Fragment>
                )}
              </Field> */}
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
      <DeletePack
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        packId={packToDelete!}
        fleetTeamId={fleetTeamId}
        fleetAccessPhrase={user.fleetAccessPhrase!}
      />
    </IssuePanelContainer>
  );
};

export default PackDetails;
