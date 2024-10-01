import React, { Fragment, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import { ValueType } from '@atlaskit/select';
import type { User } from '@prisma/client';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { Field, FormFooter } from '@atlaskit/form';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { useCreateQuery } from '@/hooks/fleets/querys/useCreateQuery';
import NodesSelector from '../NodesSelector';


const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });


interface FormData {
  sql: string;
  not_before: string;
  nodes: string[];
  tags: string;
  description;
  [key: string]: string | ValueType<Option> | boolean | number | string[];
}

interface Option {
  label: string;
  value: string;
}

const DEFAULT_PLATFORM_VALUE = 'all';

const CreateDistributors = ({
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
  const [nodesId, setNodeId] = useState<string[]>([]);
  const { t } = useTranslation('common');

  const handleNodeSelect = (nodeId: string) => {
    setNodeId((prevNodes) => [...(prevNodes || []), nodeId]);
  };

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">Create Query</Modal.Header>
      <Form<FormData>
        onSubmit={async (data, { reset }) => {
            const { description, interval, sql, tags, not_before } = data;
            const queryData = {
              description,
              interval,
              nodes: nodesId,
              not_before,
              sql,
              tags,
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
                  name="not_before"
                  label="Not Before"
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
                
                <NodesSelector fleetTeamId={fleetTeamId} fleetAccessPhrase={user.fleetAccessPhrase!} onSelect={handleNodeSelect} />
                
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
                isDisabled={nodesId.length === 0}
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

export default CreateDistributors;
