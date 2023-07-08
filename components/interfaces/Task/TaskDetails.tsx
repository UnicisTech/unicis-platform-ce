import React, { Fragment, useCallback, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { DatePicker } from '@atlaskit/datetime-picker'
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select, {
    ValueType,
} from '@atlaskit/select';
import type { ApiResponse } from "types";
import type { Task, Team } from "@prisma/client";
import AtlaskitButton from '@atlaskit/button/standard-button';
import statuses from "@/components/defaultLanding/data/statuses.json"
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import { WithoutRing, IssuePanelContainer } from "sharedStyles";
import useTask from "hooks/useTask";

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

const TaskDetails = ({
    task,
    team
}: {
    task: Task;
    team: Team
}) => {
    const router = useRouter();
    const { slug, taskNumber } = router.query;
    const { t } = useTranslation("common");
    const { mutateTask } = useTask(slug as string, taskNumber as string)
    const [isFormChanged, setIsFormChanged] = useState(false)

    const checkFormChanges = useCallback(() => {
        setIsFormChanged(true)
    }, [])

    return (
        <IssuePanelContainer>
            <Form<FormData>
                onSubmit={async (data, { reset }) => {
                    const { title, status, duedate, description } = data
                    //TODO: remove /api/tasks api
                    const response = await axios.put<ApiResponse<Task>>(
                        `/api/tasks`,
                        {
                            taskId: task.id,
                            data: {
                                title,
                                status: status?.value,
                                teamId: team.id,
                                duedate,
                                description: description || ''
                            }
                        }
                    );

                    const { error } = response.data;

                    if (error) {
                        toast.error(error.message);
                        return;
                    } else {
                        toast.success(t("task-updated"));
                        setIsFormChanged(false)
                    }

                    mutateTask();
                }}
            >
                {({ formProps }) => (
                    <form
                        {...formProps}
                    >
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
                                        <TextField autoComplete="off" {...fieldProps} onInput={checkFormChanges} />
                                    </Fragment>
                                )}
                            </Field>
                            <Field<ValueType<Option>>
                                name="status"
                                label="Status"
                                aria-required={true}
                                isRequired
                                defaultValue={statuses.find(({ value }) => value === task.status)}
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
                                            <Select inputId={id} {...rest} options={statuses} validationState={error ? 'error' : 'default'} onInputChange={checkFormChanges} />
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
                                            <DatePicker selectProps={{ inputId: id }} {...rest} onFocus={checkFormChanges} />
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
                                            onInput={checkFormChanges}
                                            placeholder=""
                                            {...fieldProps}
                                        />
                                    </Fragment>
                                )}
                            </Field>
                            <FormFooter>
                                <AtlaskitButton type="submit" appearance="primary" isDisabled={!isFormChanged}>
                                    {t("save-changes")}
                                </AtlaskitButton>
                            </FormFooter>
                        </div>
                    </form>
                )}
            </Form>
        </IssuePanelContainer>
    );
};

export default TaskDetails;
