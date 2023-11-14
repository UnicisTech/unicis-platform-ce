import React, { Fragment } from 'react';
import Select, { ValueType } from '@atlaskit/select';
import { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import type { Task } from '@prisma/client';
import { WithoutRing } from 'sharedStyles';

interface FormBodyProps {
  tasks: Task[];
}

interface TaskOption {
  label: string;
  value: Task;
}

const TaskPickerFormBody = ({ tasks }: FormBodyProps) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          width: '100%',
          margin: '0 auto',
          flexDirection: 'column',
        }}
      >
        <Field<ValueType<TaskOption>>
          name="task"
          label="Tasks"
          aria-required={true}
          isRequired
          validate={async (value) => {
            if (value) {
              return undefined;
            }

            return new Promise((resolve) => setTimeout(resolve, 300)).then(
              () => 'Please select a task'
            );
          }}
        >
          {({ fieldProps: { id, ...rest }, error }) => (
            <Fragment>
              <WithoutRing>
                <Select
                  inputId={id}
                  {...rest}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  options={tasks?.map((task) => ({
                    value: task,
                    label: task.title,
                  }))}
                  validationState={error ? 'error' : 'default'}
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </WithoutRing>
            </Fragment>
          )}
        </Field>
        <FormFooter></FormFooter>
      </div>
    </>
  );
};

export default TaskPickerFormBody;
