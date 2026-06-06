'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { useDeleteDistributed } from '@/hooks/fleets/distributors/useDeleteDistributor';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';

const DeleteDistributors = ({
  distributorId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  distributorId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const deleteDistributor = useDeleteDistributed();
  const { mutateDistributorsTasks } = useDistributors(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values, { resetForm }) => {
      if (values.confirm.toLowerCase() === 'delete') {
        const toastId = toast.loading(t('deleting'));
        try {
          await deleteDistributor(fleetTeamId, distributorId);
          mutateDistributorsTasks();
          toast.success(t('deleted-successfully'), { id: toastId });
          resetForm();
          setVisible(false);
        } catch {
          toast.error(t('error-deleting-script'), { id: toastId });
        }
      } else {
        toast.error(t('type-confirmation-text'));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-destructive">
            {t('confirm-permanent-script-delete')}
          </DialogTitle>
          <DialogDescription className="space-y-2 text-sm text-muted-foreground">
            <p>
              {t('script')}:{' '}
              <span className="text-orange-400 break-all">{distributorId}</span>
            </p>
            <p>{t('fleet:fleet-delete-warning')}</p>
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={formik.handleSubmit}
          method="DELETE"
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-medium">
              {t('confirm')}
            </Label>
            <Input
              id="confirm"
              name="confirm"
              placeholder={t('enter-confirmation-text')}
              value={formik.values.confirm}
              onChange={formik.handleChange}
              className="bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">
              {t('fleet:fleet-delete-description')}
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={formik.isSubmitting || !formik.values.confirm}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDistributors;
