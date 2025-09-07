'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'next-i18next';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Label } from '@/components/shadcn/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import { Checkbox } from '@/components/shadcn/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(1, 'Required'),
  as: z.enum(['pdf', 'csv'], {
    errorMap: () => ({ message: 'Select a format' }),
  }),
  relatives: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ExportNode = ({
  nodeId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  nodeId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: nodeId,
      as: 'pdf',
      relatives: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('form data', data);
    setVisible(false);
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t('Export Node')}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-1">
              <Label htmlFor="name">{t('Save As (Default to Node ID)')}</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <span className="text-xs text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* RadioGroup */}
            <div className="grid gap-1">
              <Label>{t('Export As PDF or CSV Documents')}</Label>
              <RadioGroup defaultValue="pdf" {...register('as')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf">PDF File Format</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv">CSV File Format</Label>
                </div>
              </RadioGroup>
              {errors.as && (
                <span className="text-xs text-red-500">
                  {errors.as.message}
                </span>
              )}
            </div>

            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox id="relatives" {...register('relatives')} />
              <Label htmlFor="relatives">
                {t('Include Relatives [Query,Pack,Node Config, Distributor] and Results')}
              </Label>
            </div>

            <span className="text-xs text-muted-foreground">
              {t('fleet-export-node-description')}
            </span>
          </div>

          <DialogFooter>
            <Button type="submit">{t('export')}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExportNode;
