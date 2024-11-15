import React, { Fragment } from 'react';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import type { Team } from '@prisma/client';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from 'sharedStyles';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { PLATFORMS } from '@/lib/fleet/constants';
import { Pack } from '@/types';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
import toast from 'react-hot-toast';
import { usePacks } from '@/hooks/fleets/packs/usePacks';


const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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

const EditPack = ({
  visible,
  setVisible,
  pack,
  team,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  pack: Pack;
  team: Team;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');
  const updatePack = useUpdatePack();
  const { mutatePacks } = usePacks(team?.id);

  return (
    <Modal open={visible}>
      <Form<FormData>
        onSubmit={async (data) => {
          const { name, platform, version, shard, description } = data;
          const packData = {name, platform: platform?.value, version, shard, description};
          try {
            await updatePack(fleetTeamId, packData, pack.id);
            toast.success(t('success'));
            mutatePacks();
            setVisible(false);
          } catch (err) {
            toast.error(t('error-updating-pack'));
          };
        }}
      >
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">Edit Pack</Modal.Header>
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
                  defaultValue={pack.name}
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
                    ({ value }) => value === pack.platform
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
                    defaultValue={pack.version}
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
                    defaultValue={pack.shard}
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>
                </div>
                
                <Field label="Description" name="description" defaultValue={pack.description}>
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

export default EditPack;
