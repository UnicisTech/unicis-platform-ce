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
import { InputWithLabel } from '@/components/shared';
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
  const { t } = useTranslation('common');
  const deletePack = useDeletePack();
  const { mutatePacks } = usePacks(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values) => {
      if (values.confirm.toLowerCase() === 'delete') {
        await deletePack(fleetTeamId, packId);
        toast.loading(t('Delete Pack'));
        mutatePacks();
        formik.resetForm();
        setVisible(false);
      } else {
        toast.error(t('Type confirmation text'));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-lg">
        <form onSubmit={formik.handleSubmit} method="DELETE" className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('Confirm Permanent Package Delete?')}</DialogTitle>
            <DialogDescription>
              {t('This action cannot be undone. Please confirm to proceed.')}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col space-y-4">
            <p className="text-xs">
              {t('package')}: <span className="text-orange-400">{packId}</span>
            </p>
            <p>{t('fleet-delete-warning')}</p>
          </div>

          <InputWithLabel
            type="text"
            label={t('Confirm')}
            name="confirm"
            placeholder={t('Enter confirmation text')}
            value={formik.values.confirm}
            error={
              formik.touched.confirm
                ? formik.errors.confirm
                : undefined
            }
            onChange={formik.handleChange}
          />

          <span className="text-xs">{t('fleet-delete-pack-description')}</span>

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
              {formik.isSubmitting ? t('Deleting...') : t('delete')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePack;
