'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { useDeletePack } from '@/hooks/fleets/packs/useDeletePack';
import { usePacks } from '@/hooks/fleets/packs/usePacks';

const DeletePack = ({
  packId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  packId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const deletePack = useDeletePack();
  const { mutatePacks } = usePacks(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values, { resetForm }) => {
      if (values.confirm.toLowerCase() === 'delete') {
        const toastId = toast.loading(t('Deleting...'));
        try {
          await deletePack(fleetTeamId, packId);
          mutatePacks();
          toast.success(t('deleting'), { id: toastId });
          resetForm();
          setVisible(false);
        } catch {
          toast.error(t('error-deleting-package'), { id: toastId });
        }
      } else {
        toast.error(t('type-confirmation-text'));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-background text-foreground border-border">
        <form
          onSubmit={formik.handleSubmit}
          method="DELETE"
          className="space-y-6"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-destructive">
              {t('confirm-permanent-package-delete')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('delete-warning')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <p>
              {t('package')}:{' '}
              <span className="text-orange-400 break-all">{packId}</span>
            </p>
            <p className="text-muted-foreground">
              {t('fleet:fleet-delete-warning')}
            </p>
          </div>

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
              {t('fleet:fleet-delete-pack-description')}
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
              {formik.isSubmitting ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePack;
