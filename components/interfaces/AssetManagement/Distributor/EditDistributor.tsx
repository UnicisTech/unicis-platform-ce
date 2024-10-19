import React, { Fragment } from 'react';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from 'sharedStyles';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { PLATFORMS } from '@/lib/fleet/constants';
import { DistributedQuery } from '@/types';
import { useUpdateQuery } from '@/hooks/fleets/querys/useUpdateQuery';
import toast from 'react-hot-toast';


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

const EditDistributors = ({
  visible,
  setVisible,
  distributor,
  fleetTeamId,
  fleetAccessPhrase
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  distributor: DistributedQuery;
  fleetTeamId: string;
  fleetAccessPhrase?: string;
}) => {
  const { t } = useTranslation('common');
  const updateQuery = useUpdateQuery();

  return (
    <Modal open={visible}>
      <Form<FormData>
        onSubmit={async (data) => {
            const { name, platform, version, shard, description, interval, packs, removed, sql, tags, value } = data;
            const queryData = {
                name,
                platform: platform?.value,
                version,
                shard,
                description,
                interval,
                packs,
                removed,
                sql,
                tags,
                value
            };
          try {
            await updateQuery(fleetTeamId, queryData, distributor.id, fleetAccessPhrase);
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
                <Field<ValueType<Option>>
                  name="platform"
                  label="Platform"
                  aria-required={true}
                  isRequired
                  defaultValue={PLATFORMS.find(
                    ({ value }) => value === distributor.sql
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
                    defaultValue={distributor.description}
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>

                </div>
                
                <Field label="Description" name="description" defaultValue={distributor.description}>
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <ReactQuill theme="snow" {...fieldProps} />
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

export default EditDistributors;
