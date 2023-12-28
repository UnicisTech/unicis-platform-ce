import React, { Fragment } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { DatePicker } from '@atlaskit/datetime-picker';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import type { ApiResponse } from 'types';
import type { Task, Team } from '@prisma/client';
import Button, { LoadingButton } from '@atlaskit/button';
import statuses from '@/components/defaultLanding/data/statuses.json';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from 'sharedStyles';
import useTasks from 'hooks/useTasks';

import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface FormData {
  title: string;
  status: ValueType<Option>;
  team: ValueType<Option>;
  duedate: string;
  [key: string]: string | ValueType<Option>;
}

interface Option {
  label: string;
  value: string;
}

const EditTask = ({
  visible,
  setVisible,
  task,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task;
  team: Team;
}) => {
  const router = useRouter();
  const { slug } = router.query;
  const { mutateTasks } = useTasks(slug as string);
  const { t } = useTranslation('common');

  return (
    <Modal open={visible}>
      <Form<FormData>
        onSubmit={async (data) => {
          const { title, status, duedate, description } = data;
          const response = await axios.put<ApiResponse<Task>>(
            `/api/teams/${team.slug}/tasks/${task.taskNumber}`,
            {
              data: {
                title,
                status: status?.value,
                teamId: team.id,
                duedate,
                description: description || '',
              },
            }
          );

          const { error } = response.data;

          if (error) {
            toast.error(error.message);
            return;
          }

          mutateTasks();
          toast.success(t('task-updated'));
          setVisible(false);
        }}
      >
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">Edit Task</Modal.Header>
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
                  name="title"
                  label="Title"
                  isRequired
                  defaultValue={task?.title}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                <Field<ValueType<Option>>
                  name="status"
                  label="Status"
                  aria-required={true}
                  isRequired
                  defaultValue={statuses.find(
                    ({ value }) => value === task.status
                  )}
                  validate={async (value) => {
                    if (value) {
                      return undefined;
                    }

                    return new Promise((resolve) =>
                      setTimeout(resolve, 300)
                    ).then(() => 'Please select a status');
                  }}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <Select
                          inputId={id}
                          {...rest}
                          options={statuses}
                          validationState={error ? 'error' : 'default'}
                        />
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                      </WithoutRing>
                    </Fragment>
                  )}
                </Field>
                <Field
                  name="duedate"
                  label="Due date"
                  defaultValue={task.duedate}
                  isRequired
                  aria-required={true}
                  validate={async (value) => {
                    if (value) {
                      return undefined;
                    }

                    return new Promise((resolve) =>
                      setTimeout(resolve, 300)
                    ).then(() => 'Please select a due date');
                  }}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <DatePicker
                          selectProps={{ inputId: id }}
                          {...rest}
                          locale="en-GB"
                        />
                      </WithoutRing>
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </Fragment>
                  )}
                </Field>
                <Field
                  label="Description"
                  name="description"
                  defaultValue={task.description || ''}
                >
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

export default EditTask;
