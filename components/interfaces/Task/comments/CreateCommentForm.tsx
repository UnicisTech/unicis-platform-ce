import React, { Fragment } from 'react';
import { Button } from 'react-daisyui';
import Form, { Field, FormFooter } from '@atlaskit/form';
import { useTranslation } from 'next-i18next';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface FormData {
  text: string;
}

interface CreateCommentFormProps {
  handleCreate: (
    text: string,
    reset: (initialValues?: Partial<FormData> | undefined) => void
  ) => Promise<void>;
}
const CreateCommentForm = ({ handleCreate }: CreateCommentFormProps) => {
  const { t } = useTranslation('common');
  //TODO: remade to formik
  return (
    <Form
      onSubmit={async (formState: FormData, { reset }) => {
        await handleCreate(formState.text, reset);
      }}
    >
      {({ formProps }: any) => (
        <form {...formProps}>
          <Field name="text">
            {({ fieldProps }: any) => (
              <Fragment>
                <ReactQuill defaultValue={'Add a comment...'} {...fieldProps} />
              </Fragment>
            )}
          </Field>
          <FormFooter align="start">
            <Button size="sm" color="primary" variant="outline" type="submit">
              {t('save')}
            </Button>
          </FormFooter>
        </form>
      )}
    </Form>
  );
};

export default CreateCommentForm;
