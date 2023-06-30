import React, { Fragment } from 'react';
import { useRouter } from "next/router";
import type { Task } from '@prisma/client';
import toast from "react-hot-toast";
import axios from "axios";
import type { ApiResponse } from "types";
import Button from '@atlaskit/button';
import Form, { Field, FormFooter } from '@atlaskit/form';
import type { TaskWithComments } from 'types';
import { IssuePanelContainer } from 'sharedStyles';
import { formatDate } from '@/lib/tasks';

import TextArea from '@atlaskit/textarea';

interface FormData {
  text: string;
}

export default function AddComment({
  task,
  mutateTask
}: {
  task: TaskWithComments;
  mutateTask: () => Promise<void>
}) {
  const router = useRouter();
  const { slug, taskNumber } = router.query;

  return (
    <IssuePanelContainer>
      <div style={{ marginTop: '30px' }}>
        {task.comments.map(comment => (
          <div style={{ margin: '15px' }}>
            <div className="flex gap-3.5">
              <p className="font-bold ...">{comment.createdBy.name}</p>
              <p>{formatDate(String(comment.createdAt))}</p>
            </div>
            <p className="my-2">{comment.text}</p>
            <Button 
              appearance='subtle-link' 
              style={{padding: '0px'}} 
              spacing="compact" 
              onClick={async () => {
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
              }}
            >
              <span style={{color: "#f08080"}}>Delete</span>
            </Button>
          </div>
        ))}
      </div>
      <Form
        onSubmit={async (formState: FormData, { reset }) => {
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
    </IssuePanelContainer>
  );
}