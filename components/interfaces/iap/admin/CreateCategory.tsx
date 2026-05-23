import * as React from 'react';
import { useTranslation } from 'next-i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/shadcn/ui/dialog';
import { defaultHeaders } from '@/lib/common';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';

interface IapCategoryFormData {
  name: string;
}

interface CreateIapCategoryProps {
  teamSlug: string;
  visible: boolean;
  setVisible: (v: boolean) => void;
  mutate: () => Promise<void>;
}

export default function CreateIapCategory({
  teamSlug,
  visible,
  setVisible,
  mutate,
}: CreateIapCategoryProps) {
  const { t } = useTranslation('common');
  const form = useForm<IapCategoryFormData>({ defaultValues: { name: '' } });

  const onSubmit: SubmitHandler<IapCategoryFormData> = async (data) => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/iap/category`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      const json = (await response.json()) as ApiResponse<any>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('iap-category-saved'));
      await mutate();
      setVisible(false);
      form.reset();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>{t('create-category-title')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required:
                  t('category-name-required') || 'Category name is required.',
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('category-name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>
                    {fieldState.error ? fieldState.error.message : null}
                  </FormMessage>
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={form.formState.isSubmitting}
                  onClick={() => setVisible(false)}
                >
                  {t('close')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t('saving') || 'Saving...'
                  : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
