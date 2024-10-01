import React, { Fragment, useRef } from 'react';
import { Team } from '@prisma/client';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import { Radio } from '@atlaskit/radio';
import Select, { ValueType } from '@atlaskit/select';
import type { User } from '@prisma/client';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from 'sharedStyles';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { PLATFORMS } from "@/lib/fleet/constants";
import { useCreateQuery } from '@/hooks/fleets/querys/useCreateQuery';

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

const DEFAULT_PLATFORM_VALUE = 'all';

const CreateQuery = ({
  visible,
  setVisible,
  user,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  user: Partial<User>;
  fleetTeamId: string;
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const createQuery = useCreateQuery();
  const { t } = useTranslation('common');

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">Create Query</Modal.Header>
      <Form<FormData>
        onSubmit={async (data, { reset }) => {
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
                await createQuery(fleetTeamId, queryData, user.fleetAccessPhrase!);
                toast.success(t('success-creating-pack'));
            } catch (err) {
                toast.error(t('error-creating-pack'));
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
                  defaultValue={PLATFORMS.find(
                    ({ value }) => value === DEFAULT_PLATFORM_VALUE
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
                            ({ value }) => value === DEFAULT_PLATFORM_VALUE
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
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>
 
                {/* <Field
                    aria-required={false}
                    name="removed"
                    label="Removed"
                    isRequired
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <Radio onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field> */}
                  
                </div>
                
                <Field label="Description" name="description">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <ReactQuill theme="snow" {...fieldProps} />
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
                        <TextField autoComplete="off" {...fieldProps} />
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
    </Modal>
  );
};

export default CreateQuery;
