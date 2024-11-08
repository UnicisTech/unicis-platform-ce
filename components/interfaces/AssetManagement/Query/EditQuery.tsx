import React, { Fragment, useState } from 'react';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import CheckboxField from '@atlaskit/checkbox';
import Select, { ValueType } from '@atlaskit/select';
import type { Team } from '@prisma/client';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from 'sharedStyles';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { PLATFORMS } from '@/lib/fleet/constants';
import { Query } from '@/types';
import { useUpdateQuery } from '@/hooks/fleets/queries/useUpdateQuery';
import toast from 'react-hot-toast';
import PacksSelector from '../PacksSelector';
import TagsSelector from '../TagsSelector';


const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface FormData {
    name;
    sql: string;
    interval: number;
    platform: ValueType<Option>;
    version;
    value;
    removed: boolean;
    packs: string[];
    tags: string;
    shard: number;
    description;
    [key: string]: string | ValueType<Option> | boolean | number | string[];
}

interface Option {
  label: string;
  value: string;
}

const EditQuery = ({
  visible,
  setVisible,
  query,
  team,
  fleetTeamId,
  fleetAccessPhrase
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  query: Query;
  team: Team;
  fleetTeamId: string;
  fleetAccessPhrase?: string;
  }) => {
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { t } = useTranslation('common');
  const updateQuery = useUpdateQuery();

  return (
    <Modal open={visible}>
      <Form<FormData>
        onSubmit={async (data) => {
            const { name, platform, version, shard, description, interval, removed, sql, value } = data;
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
            await updateQuery(fleetTeamId, queryData, query.id, fleetAccessPhrase);
          } catch (err) {
            toast.error(t('error-updating-query'));
          };
        }}
      >
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">Edit Query</Modal.Header>
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
                  defaultValue={query.name}
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
                  defaultValue={query.sql}
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
                    ({ value }) => value === query.platform
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
                            ({ value }) => value === query.platform
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
                    defaultValue={query.version}
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
                    defaultValue={query.shard}
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
                    defaultValue={query.interval}
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
                    defaultValue={query.value}
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
                
                <Field label="Description" name="description" defaultValue={query.description}>
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <ReactQuill theme="snow" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                
                <Field label="Assign Packs" name="packs">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <PacksSelector fleetTeamId={fleetTeamId} fleetAccessPhrase={fleetAccessPhrase!} preSelectedPack={query.packs} setSectionPack={setSelectedPacks} onSelect={(packIds)=>{}}/>
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
                      <TagsSelector fleetTeamId={fleetTeamId} fleetAccessPhrase={fleetAccessPhrase!} preSelectedTag={query.tags} setSectionTag={setSelectedTags} onSelect={(tagIds)=>{}}/>
                    </Fragment>
                  )}
                </Field>
                <FormFooter></FormFooter>
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
                isLoading={submitting}
              >
                {t('save-changes')}
              </LoadingButton>
            </Modal.Actions>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default EditQuery;
