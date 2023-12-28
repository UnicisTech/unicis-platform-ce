import React, { Fragment, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { DatePicker } from '@atlaskit/datetime-picker';
import TextField from '@atlaskit/textfield';
import Select, { ValueType } from '@atlaskit/select';
import { Button } from 'react-daisyui';
import type { ApiResponse } from 'types';
import type { Task, Team } from '@prisma/client';
import statuses from '@/components/defaultLanding/data/statuses.json';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing, IssuePanelContainer } from 'sharedStyles';
import useTask from 'hooks/useTask';
import useCanAccess from 'hooks/useCanAccess';

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

const TaskDetails = ({ task, team }: { task: Task; team: Team }) => {
  const router = useRouter();
  const { slug, taskNumber } = router.query;
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { mutateTask } = useTask(slug as string, taskNumber as string);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);

  return (
    <IssuePanelContainer>
      <Form<FormData>
        onSubmit={async (data) => {
          if (!isFormChanged) {
            return;
          }
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
          } else {
            toast.success(t('task-updated'));
            setIsFormChanged(false);
          }

          mutateTask();
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
                name="title"
                label="Title"
                isRequired
                defaultValue={task?.title}
              >
                {({ fieldProps }) => (
                  <Fragment>
                    <TextField
                      autoComplete="off"
                      {...fieldProps}
                      onInput={checkFormChanges}
                    />
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
                        onInputChange={checkFormChanges}
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
                        onFocus={checkFormChanges}
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
              </Field>
              <FormFooter>
                {canAccess('task', ['update']) && (
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
              </FormFooter>
            </div>
          </form>
        )}
      </Form>
    </IssuePanelContainer>
  );
};

export default TaskDetails;
