import React, { Fragment, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import TextField from '@atlaskit/textfield';
import { DateTimePicker } from '@atlaskit/datetime-picker';
import { ValueType } from '@atlaskit/select';
import type { User } from '@prisma/client';
import Button, { LoadingButton } from '@atlaskit/button';
import Form, { Field, FormFooter } from '@atlaskit/form';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import NodesSelector from '../NodesSelector';
import { useCreateDistributors } from '@/hooks/fleets/distributors/useCreateDistributor';
import TagsSelector from '../TagsSelector';
import TextArea from '@atlaskit/textarea';


const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });


interface FormData {
  sql: string;
  not_before: string;
  nodes: string[];
  tags: string[];
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
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { t } = useTranslation('common');
  const createDistributor = useCreateDistributors();
  const handleNodeSelection = (nodeKeys: string[]) => {
    console.log("Selected Node Keys:", nodeKeys);
  };

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">Create Distributor</Modal.Header>
      <Form<FormData>
        onSubmit={async (data, { reset }) => {
            const { description, interval, sql, tags, not_before } = data;
            const queryData = {
              description,
              interval,
              nodes: selectedNodes,
              not_before,
              sql,
              tags: selectedTags,
            };
            try {
              await createDistributor(fleetTeamId, queryData, user.fleetAccessPhrase!);
              toast.success(t('success'));
            } catch (err) {
              toast.error(t('error'));
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
                  name="sql"
                  label="SQL Code"
                  isRequired
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField height={50} autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                
                <Field label="Assign Nodes" name="nodes">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <NodesSelector fleetTeamId={fleetTeamId} fleetAccessPhrase={user.fleetAccessPhrase!} setSectionNode={setSelectedNodes} onSelect={handleNodeSelection} />
                    </Fragment>
                  )}
                </Field>
                
                <Field label="Description" name="description">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <ReactQuill theme="snow" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>

                <Field
                  aria-required={true}
                  name="not_before"
                  label="Not Before"
                  isRequired
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <DateTimePicker
                        dateFormat="YYYY-MM-DD"
                        timeFormat="HH:mm:ss"
                        timeIsEditable={true}
                        {...fieldProps}
                      />
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
                      <TagsSelector fleetTeamId={fleetTeamId} fleetAccessPhrase={user.fleetAccessPhrase!} setSectionTag={setSelectedTags} onSelect={()=>{}}/>
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

export default CreateDistributors;
