import React, { Fragment } from "react";
import type { TeamWithMemberCount } from "types";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "react-daisyui";
import { useTranslation } from "next-i18next";
import { DatePicker } from '@atlaskit/datetime-picker'
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select, {
  ValueType,
} from '@atlaskit/select';

import type { ApiResponse } from "types";
import type { Task } from "@prisma/client";
import AtlaskitButton from '@atlaskit/button/standard-button';
import statuses from "data/statuses.json";


import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import styled from 'styled-components'
import useTasks from "hooks/useTasks";

const WithoutRing = styled.div`
    input {
        --tw-ring-shadow: 0 0 #000 !important;
    }
`

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
  teams
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task;
  teams: Array<TeamWithMemberCount>;
}) => {
  const { mutateTasks } = useTasks()
  const { t } = useTranslation("common");

  console.log('EditTask task', task)
  
  return (
    <Modal open={visible}>
      <Form<FormData>
        onSubmit={async (data, {reset}) => {
          const { title, status, team, duedate, description } = data
          console.log('edit submit data', data)
          const response = await axios.put<ApiResponse<Task>>(
            `/api/tasks`,
            {
                taskId: task.id,
                data: {
                    title,
                    status: status?.value,
                    teamId: team?.value,
                    duedate,
                    description: description || ''
                  }
            }
          );
    
          const { data: updatedTask, error } = response.data;

          if (error) {
            toast.error(error.message);
            return;
          }
          
          mutateTasks();
        //   reset({
        //     title: '',
        //     status: null,
        //     team: null,
        //     duedate: '',
        //     description: ''
        //   });
          setVisible(false);
        }}
      >
        {({ formProps }) => (
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
                  {({ fieldProps, error }) => (
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
                  defaultValue={statuses.find(({value}) => value === task.status)}
                  validate={async (value) => {
                    if (value) {
                      return undefined;
                    }
  
                    return new Promise((resolve) =>
                      setTimeout(resolve, 300),
                    ).then(() => 'Please select a status');
                  }}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <Select inputId={id} {...rest} options={statuses} validationState={error ? 'error' : 'default'}/>
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                      </WithoutRing>
                    </Fragment>
                  )}
                </Field>
                <Field<ValueType<Option>>
                  name="team"
                  label="Team"
                  aria-required={true}
                  isRequired
                  defaultValue={teams.map(({id, name}) => ({label: name, value: id})).find(({value}) => value === task.teamId)}
                  validate={async (value) => {
                    if (value) {
                      return undefined;
                    }
  
                    return new Promise((resolve) =>
                      setTimeout(resolve, 300),
                    ).then(() => 'Please select a team');
                  }}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <Select inputId={id} {...rest} options={teams.map(({id, name}) => ({label: name, value: id}))} validationState={error ? 'error' : 'default'}/>
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
                      setTimeout(resolve, 300),
                    ).then(() => 'Please select a due date');
                  }}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <DatePicker selectProps={{ inputId: id }} {...rest} />
                      </WithoutRing>
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </Fragment>
                  )}
                </Field>
                <Field 
                    label="Description" 
                    name="description"
                    defaultValue={task.description || ""}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea
                        placeholder=""
                        {...fieldProps}
                      />
                    </Fragment>
                  )}
                </Field>
                <FormFooter>
                </FormFooter>
              </div>
            </Modal.Body>
            <Modal.Actions>
              <AtlaskitButton 
                appearance="default"
                onClick={() => {
                  setVisible(!visible)
                }}
              >
                {t("close")}
              </AtlaskitButton>
              <AtlaskitButton type="submit" appearance="primary">
                {t("save-changes")}
              </AtlaskitButton>
            </Modal.Actions>
          </form>
        )}
      </Form>

    </Modal>
  );
};

export default EditTask;
