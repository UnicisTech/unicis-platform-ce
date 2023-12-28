import React, { Fragment } from 'react';
import { getAxiosError } from '@/lib/common';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import type { Task } from '@prisma/client';
import toast from 'react-hot-toast';
import axios from 'axios';
import type { ApiResponse } from 'types';
import AtlaskitButton from '@atlaskit/button';
import { Button } from 'react-daisyui';
import Form, { Field, FormFooter } from '@atlaskit/form';
import type { TaskExtended } from 'types';
import { IssuePanelContainer } from 'sharedStyles';
import { formatDate } from '@/lib/tasks';

import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface FormData {
  text: string;
}

export default function AddComment({
  task,
  mutateTask,
}: {
  task: TaskExtended;
  mutateTask: () => Promise<void>;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug, taskNumber } = router.query;

  return (
    <IssuePanelContainer>
      <div style={{ marginTop: '30px' }}>
        {task.comments.map((comment, index) => (
          <div key={index} style={{ margin: '15px' }}>
            <div className="flex gap-3.5">
              <p className="font-bold ...">{comment.createdBy.name}</p>
              <p>{formatDate(String(comment.createdAt))}</p>
            </div>
            <p className="my-2">{comment.text}</p>
            {/* <Markdown rehypePlugins={[rehypeRaw]}>{comment.text}</Markdown> */}
            {/* <ReactQuill
              defaultValue={comment.text}
              readOnly={true}
              modules={{
                "toolbar": false
              }}
            /> */}
            <AtlaskitButton
              appearance="danger"
              style={{ padding: '0px' }}
              spacing="compact"
              onClick={async () => {
                try {
                  const response = await axios.delete<ApiResponse<unknown>>(
                    `/api/teams/${slug}/tasks/${taskNumber}/comments`,
                    {
                      data: {
                        id: comment.id,
                      },
                    }
                  );
                  const { error } = response.data;

                  if (error) {
                    toast.error(error.message);
                    return;
                  }

                  mutateTask();
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
            const { text } = formState;
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

            mutateTask();

            reset({
              text: '',
            });
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
                  <ReactQuill
                    defaultValue={'Add a comment...'}
                    {...fieldProps}
                  />
                </Fragment>
              )}
            </Field>
            <FormFooter>
              <Button size="sm" color="primary" variant="outline" type="submit">
                {t('submit')}
              </Button>
            </FormFooter>
          </form>
        )}
      </Form>
    </IssuePanelContainer>
  );
}
