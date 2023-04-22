import React, { Fragment } from 'react';
import { useRouter } from "next/router";
import type { Task } from '@prisma/client';
import toast from "react-hot-toast";
import axios from "axios";
import type { ApiResponse } from "types";
import Button from '@atlaskit/button/standard-button';
import Form, { Field, FormFooter } from '@atlaskit/form';
import type { TaskWithComments } from 'types';

import TextArea from '@atlaskit/textarea';

interface FormData {
    text: string;
  }

export default function AddComment({
    task,
    mutateTask
} : {
    task: TaskWithComments;
    mutateTask: () => Promise<void>
}) {
  const router = useRouter();
  const { slug, taskNumber } = router.query;

  return (
    <> 
      <div style={{marginTop: '30px'}}>
        {task.comments.length && <h1>Comments:</h1>}
        {task.comments.map(comment => (
          <div style={{margin: '15px'}}>
            <p>{`Author: ${comment.createdBy.name}`}</p>
            <p>{`Created at: ${comment.createdAt}`}</p>
            <p>{`Text: ${comment.text}`}</p>
            <p>{`Id: ${comment.id}`}</p>
            <button onClick={async () => {
              const response = await axios.delete<ApiResponse<unknown>>(
                `/api/teams/${slug}/tasks/${taskNumber}/comments`,
                {
                  data: {
                    id: comment.id
                  }
                }
              );
              const { error } = response.data;
        
              if (error) {
                toast.error(error.message);
                return;
              }

              mutateTask()
            }}>delete</button>
          </div>
        ))}
      </div>
      <Form
        onSubmit={async (formState: FormData, {reset}) => {
              console.log('form submitted', {formState, task})
              const { text } = formState
              const response = await axios.post<ApiResponse<Task>>(
                `/api/teams/${slug}/tasks/${taskNumber}/comments`,
                {
                  text,
                  taskId: task.id
                }
              );
        
              const { error } = response.data;
        
              if (error) {
                toast.error(error.message);
                return;
              }

              mutateTask()

              reset({
                text: ''
              })              
          }
        }
      >
        {({ formProps }: any) => (
          <form {...formProps}>
            <Field name="text">
              {({ fieldProps }: any) => (
                <Fragment>
                  <TextArea
                    placeholder="Add a comment..."
                    {...fieldProps}
                  />
                </Fragment>
              )}
            </Field>
            <FormFooter>
              <Button type="submit" appearance="primary">
                Submit
              </Button>
            </FormFooter>
          </form>
        )}
      </Form>
    </>
  );
}