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
import DeleteQuery from './DeleteDistributorResult';
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

const DistributorsDetails = ({ user, queryID, fleetTeamId }: { user: Partial<User>, queryID: string, fleetTeamId: string }) => {
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
      <Form<FormData>
        onSubmit={async (data) => {
          const { name, platform, version, shard, description } = data;
          const queryData = {name, platform: platform?.value, version, shard, description};
          try {
            await updateQuery(fleetTeamId!, queryData, queryID, user.fleetAccessPhrase!);
          } catch (err) {
            toast.error(t('error-updating-query'));
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
                defaultValue={query?.name}
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
                  ({ value }) => value === query?.platform
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
                  defaultValue={query?.version}
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
                  defaultValue={query?.shard}
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
                {canAccess('team_fleet_query', ['update']) && (
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
                {canAccess('team_fleet_query', ['delete']) && (
                  <Button
                    className="dark:text-gray-100"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      openDeleteModal(query?.id!);
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

export default DistributorsDetails;
