import React from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'next-i18next';
import {
  DEFAULT_FLEET_CONFIG_SHARD,
  DEFAULT_FLEET_CONFIG_VERSION,
} from '@/lib/fleet/constants';
import { Pack } from '@/types';
import { Team } from '@/generated/client';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
import { usePacks } from '@/hooks/fleets/packs/usePacks';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const EditPack = ({
  visible,
  setVisible,
  pack,
  team,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  pack: Pack;
  team: Team;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');
  const updatePack = useUpdatePack();
  const { mutatePacks } = usePacks(team?.id);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('name-required')),
    description: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: pack.name || '',
      description: pack.description || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updatePack(
          fleetTeamId,
          {
            ...values,
            platform: pack.platform || 'all',
            version: pack.version || DEFAULT_FLEET_CONFIG_VERSION,
            shard: pack.shard || DEFAULT_FLEET_CONFIG_SHARD,
          },
          pack.id
        );
        toast.success(t('success'));
        mutatePacks();
        setVisible(false);
      } catch {
        toast.error(t('error-updating-pack'));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('edit-pack')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              autoFocus
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t('enter-name')}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <ReactQuill
              theme="snow"
              value={formik.values.description}
              onChange={(val) => formik.setFieldValue('description', val)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? t('saving') : t('save-changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPack;
