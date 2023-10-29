import React, { Fragment, useRef } from "react";
import { Team } from "@prisma/client";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "react-daisyui";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { DatePicker } from '@atlaskit/datetime-picker'
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select, {
  ValueType,
} from '@atlaskit/select';

import type { ApiResponse } from "types";
import type { Task } from "@prisma/client";
import AtlaskitButton from '@atlaskit/button/standard-button';
import statusesData from "@/components/defaultLanding/data/statuses.json"

import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing } from "sharedStyles";
import useTasks from "hooks/useTasks";
import { getCurrentStringDate } from "@/components/services/taskService";

interface Status {
  label: string;
  value: string;
}

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

const statuses: Status[] = statusesData

const CreateTask = ({
  visible,
  setVisible,
  team
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const { slug } = router.query;
  const { mutateTasks } = useTasks(slug as string)
  const { t } = useTranslation("common");

  return (
    <Modal open={visible} style={{ height: "80%" }}>
      <Modal.Header className="font-bold">Create Task</Modal.Header>
      <Form<FormData>
        onSubmit={async (data, { reset }) => {
          const { title, status, duedate, description } = data
          const response = await axios.post<ApiResponse<Task>>(
            `/api/teams/${team.slug}/tasks`,
            {
              title,
              status: status?.value,
              duedate,
              description: description || ''
            }
          );

          const { error } = response.data;

          if (error) {
            toast.error(error.message);
            return;
          }

          mutateTasks();
          reset({
            title: '',
            status: null,
            team: null,
            duedate: '',
            description: ''
          });
          setVisible(false);
        }}
      >
        {({ formProps }) => (
          <form {...formProps} ref={formRef} className="flex flex-col justify-between" style={{height: '92%'}}>

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
                  defaultValue={statuses.find(({ value }) => value === "todo")}
                  aria-required={true}
                  isRequired
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
                        <Select
                          inputId={id}
                          {...rest}
                          options={statuses}
                          defaultValue={statuses.find(({ value }) => value === "todo")}
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
                  defaultValue={getCurrentStringDate()}
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
                        <DatePicker 
                          selectProps={{ inputId: id }} 
                          {...rest} 
                          
                          //placeholder={'ssss'}
                          locale="en-GB"
                          //onChange={event => console.log('change event', event)}
                        />
                      </WithoutRing>
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </Fragment>
                  )}
                </Field>
                <Field label="Description" name="description">
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <TextArea
                        placeholder=""
                        {...fieldProps}
                        shouldFitContainer
                        className="unicis-textarea"
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
              <AtlaskitButton type="submit" appearance="primary" ref={submitButtonRef}>
                {t("create")}
              </AtlaskitButton>
            </Modal.Actions>
          </form>
        )}
      </Form>

    </Modal>
  );
};

export default CreateTask;
