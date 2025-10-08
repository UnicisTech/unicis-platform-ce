import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import React from 'react';
import { useTranslation } from 'next-i18next';
import type { WebookFormSchema } from 'types';
import type { FormikConfig } from 'formik';
import EventTypes from './EventTypes';
import { cn } from '../shadcn/lib/utils';

interface FormProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialValues: WebookFormSchema;
  onSubmit: FormikConfig<WebookFormSchema>['onSubmit'];
  title: string;
}

const Form = ({
  visible,
  setVisible,
  initialValues,
  onSubmit,
  title,
}: FormProps) => {
  const { t } = useTranslation('common');

  const formik = useFormik<WebookFormSchema>({
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      url: Yup.string().required().url(),
      eventTypes: Yup.array().min(1, 'Please choose at least one event type'),
    }),
    initialValues,
    enableReinitialize: true,
    onSubmit,
    validateOnBlur: false,
  });

  const toggleVisible = () => {
    setVisible(!visible);
    formik.resetForm();
  };

  return (
    <Dialog open={visible} onOpenChange={toggleVisible}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={formik.handleSubmit} method="POST">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{t('webhook-create-desc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Description</Label>
              <Input
                id="name"
                name="name"
                placeholder="Description of what this endpoint is used for."
                onChange={formik.handleChange}
                value={formik.values.name}
                className={cn(
                  formik.errors.name &&
                    'border-destructive focus-visible:ring-destructive'
                )}
              />
              {formik.errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="url">Endpoint</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://api.example.com/svix-webhooks"
                onChange={formik.handleChange}
                value={formik.values.url}
                className={cn(
                  formik.errors.url &&
                    'border-destructive focus-visible:ring-destructive'
                )}
              />
              <p className="text-sm text-muted-foreground mt-1">
                The endpoint URL must be HTTPS
              </p>
              {formik.errors.url && (
                <p className="text-xs text-destructive mt-1">
                  {formik.errors.url}
                </p>
              )}
            </div>
            <div>
              <Label>{t('events-to-send')}</Label>
              <p className="text-sm text-muted-foreground mb-2">
                {t('events-description')}
              </p>
              <EventTypes
                setFieldValue={formik.setFieldValue}
                values={formik.values.eventTypes}
                error={formik.errors.eventTypes}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={toggleVisible}>
              {t('close')}
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting || !formik.dirty}
            >
              {t('create-webhook')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Form;
