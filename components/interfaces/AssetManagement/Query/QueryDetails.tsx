import { Fragment, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
import { PLATFORMS } from '@/lib/fleet/constants';
import { IssuePanelContainer, WithoutRing } from '@/sharedStyles';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import Select, { ValueType } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import CheckboxField from '@atlaskit/checkbox';
import toast from 'react-hot-toast';
import DeleteQuery from './DeleteQuery';
import { useGetQueryId } from '@/hooks/fleets/queries/useGetQueryId';
import { useUpdateQuery } from '@/hooks/fleets/queries/useUpdateQuery';
import { Modal } from 'react-daisyui';
import PacksSelector from '../PacksSelector';
import TagsSelector from '../TagsSelector';
import Button, { LoadingButton } from '@atlaskit/button';


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
  const [visible, setVisible] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const updateQuery = useUpdateQuery();
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);

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
        onSubmit={async (data, { reset }) => {
            const { name, platform, version, shard, description, interval, removed, sql, tags, value } = data;
            const queryData = {
                name,
                platform: platform?.value,
                version,
                shard,
                description,
                interval,
                packs: selectedPacks,
                removed,
                sql,
                tags: selectedTags.join(','),
                value
            };
            try {
                await updateQuery(fleetTeamId, queryData, user.fleetAccessPhrase!);
                toast.success(t('success-creating-query'));
            } catch (err) {
                toast.error(t('error-creating-query'));
            };
        }}
      >
        {({ formProps, submitting }) => (
          <form
            {...formProps}
            ref={formRef}
            className="flex flex-col justify-between"
            style={{ height: '92%' }}
          >
            <Modal.Body>
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
                
                <Field
                  aria-required={true}
                  name="sql"
                  label="SQL Code"
                  isRequired
                  defaultValue={query?.sql}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField height={50} autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                
                <Field<ValueType<Option>>
                  name="platform"
                  label="Platform"
                  defaultValue={PLATFORMS.find(
                    ({ value }) => value === query?.platform
                  )}
                  aria-required={true}
                  isRequired
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
                          defaultValue={PLATFORMS.find(
                            ({ value }) => value === query?.platform
                          )}
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

                <div className='grid grid-cols-2 gap-2'>
                  <Field
                      aria-required={true}
                      name="interval"
                      label="Interval"
                    isRequired
                    defaultValue={query?.interval}
                    >
                    {({ fieldProps }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>
                  <Field
                    aria-required={true}
                    name="value"
                    label="Value"
                    isRequired
                    defaultValue={query?.value}
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>
 
                <Field
                    aria-required={false}
                    name="removed"
                    label="Removed"
                    isRequired
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <CheckboxField isChecked={query?.removed} autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>
                  
                </div>
                
                {/* <Field label="Description" name="description">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <ReactQuill theme="snow" {...fieldProps} />
                    </Fragment>
                  )}
                </Field> */}
                
                <Field label="Assign Packs" name="packs">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <PacksSelector fleetTeamId={fleetTeamId} fleetAccessPhrase={user.fleetAccessPhrase!} preSelectedPack={query?.packs} setSectionPack={setSelectedPacks} onSelect={(packIds)=>{}}/>
                    </Fragment>
                  )}
                </Field>

                <Field
                  aria-required={false}
                  name="tags"
                  label="Tags"
                  isRequired={false}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TagsSelector fleetTeamId={fleetTeamId} fleetAccessPhrase={user.fleetAccessPhrase!} preSelectedTag={query?.tags} setSectionTag={setSelectedTags} onSelect={(tagIds)=>{}}/>
                    </Fragment>
                  )}
                </Field>
                <FormFooter>
                </FormFooter>
              </div>
            </Modal.Body>
            <Modal.Actions>
              <Button
                appearance="default"
                onClick={() => {
                  setVisible(!visible);
                }}
              >
                {t('close')}
              </Button>
              <LoadingButton
                type="submit"
                appearance="primary"
                ref={submitButtonRef}
                isLoading={submitting}
              >
                {t('create')}
              </LoadingButton>
            </Modal.Actions>
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

export default QueryDetails;
