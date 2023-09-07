import React, { Fragment } from 'react';
import { getAxiosError } from '@/lib/common';
import { useRouter } from "next/router";
import { useTranslation } from 'next-i18next';
import type { Task } from '@prisma/client';
import toast from "react-hot-toast";
import axios from "axios";
import type { ApiResponse } from "types";
import AtlaskitButton from '@atlaskit/button';
import { Button } from 'react-daisyui';
import Form, { Field, FormFooter } from '@atlaskit/form';
import type { TaskExtended } from 'types';
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
  task: TaskExtended;
  mutateTask: () => Promise<void>
}) {
  const { t } = useTranslation('common');
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
            <AtlaskitButton
              appearance='danger'
              style={{ padding: '0px' }}
              spacing="compact"
              onClick={async () => {
                try {
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
                } catch (error: any) {
                  toast.error(getAxiosError(error));
                }
              }}
            >
              Delete
            </AtlaskitButton>
          </div>
        ))}
      </div>
      <Form
        onSubmit={async (formState: FormData, { reset }) => {
          try {
            const { text } = formState
            const response = await axios.post<ApiResponse<Task>>(
              `/api/teams/${slug}/tasks/${taskNumber}/comments`,
              {
                text,
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
          } catch (error: any) {
            toast.error(getAxiosError(error));
          }
        }}
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
              <Button
                size="sm"
                color="primary"
                variant="outline"
                //className="text-white"
                type="submit"
              >
                {t("submit")}
              </Button>
              {/* <Button type="submit" appearance="primary">
                Submit
              </Button> */}
            </FormFooter>
          </form>
        )}
      </Form>
    </IssuePanelContainer>
  );
}