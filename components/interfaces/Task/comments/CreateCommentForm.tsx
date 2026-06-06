import * as React from 'react';
import { useTranslation } from 'next-i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form';
import { Button } from '@/components/shadcn/ui/button';
import QuillEditor from '@/components/shared/QuillEditor';

interface FormData {
  text: string;
}

interface CreateCommentFormProps {
  handleCreate: (
    text: string,
    reset: (
      values?: Partial<FormData>,
      options?: {
        keepErrors?: boolean;
        keepTouched?: boolean;
        keepDirty?: boolean;
        keepIsSubmitted?: boolean;
        keepSubmitCount?: boolean;
      }
    ) => void
  ) => Promise<void>;
}

const stripHtml = (html: string) => {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function CreateCommentForm({
  handleCreate,
}: CreateCommentFormProps) {
  const { t } = useTranslation('common');
  const form = useForm<FormData>({
    defaultValues: { text: '' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await handleCreate(data.text, form.reset);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          rules={{
            validate: (value: string) => {
              const plain = stripHtml(value).trim();
              return plain.length > 0 || 'Please enter a non-empty comment.';
            },
          }}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <QuillEditor
                  enableEmojiPicker
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage>
                {fieldState.error ? fieldState.error.message : null}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" variant="outline">
          {t('save', 'Save')}
        </Button>
      </form>
    </Form>
  );
}
