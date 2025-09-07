'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useDeleteNode } from '@/hooks/fleets/Nodes/useDeleteNode';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';

const DeleteNode = ({
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
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');

  const deleteNode = useDeleteNode();
  const { mutateNodes } = useNodes(fleetTeamId, 'all');

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values) => {
      if (values.confirm.toLowerCase() === 'delete') {
        toast.loading(t('Delete Node'));
        await deleteNode(fleetTeamId, nodeId);
        formik.resetForm();
        setVisible(false);
        mutateNodes();
      } else {
        toast.error(t('Type confirmation text'));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent>
        <form onSubmit={formik.handleSubmit} method="DELETE">
          <DialogHeader>
            <DialogTitle>{t('Confirm Permanent Asset Delete?')}</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <p className="text-xs">
              {t('asset')}: <span className="text-orange-400">{nodeId}</span>
            </p>
            <p>{t('fleet-delete-warning')}</p>
          </div>

          <div className="mt-4">
            <InputWithLabel
              type="text"
              label={t('confirm')}
              name="confirm"
              placeholder={t('Enter confirmation text')}
              value={formik.values.confirm}
              error={formik.touched.confirm ? formik.errors.confirm : undefined}
              onChange={formik.handleChange}
            />
            <span className="text-xs">{t('fleet-delete-description')}</span>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="submit"
              variant="destructive"
              disabled={formik.isSubmitting || !formik.dirty}
            >
              {t('delete')}
            </Button>
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

export default DeleteNode;
