import React from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'next-i18next';
import { PLATFORMS } from '@/lib/fleet/constants';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
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
    platform: Yup.string().required(t('platform-required')),
    version: Yup.string().required(t('version-required')),
    shard: Yup.string().required(t('shard-required')),
    description: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: pack.name || '',
      platform: pack.platform || 'all',
      version: pack.version || '',
      shard: pack.shard || '',
      description: pack.description || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updatePack(fleetTeamId, values, pack.id);
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
      <DialogContent className="max-w-2xl">
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
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t('enter-name')}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">{t('platform')}</Label>
            <Select
              value={formik.values.platform}
              onValueChange={(value) => formik.setFieldValue('platform', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select-platform')} />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.platform && formik.errors.platform && (
              <p className="text-sm text-destructive">
                {formik.errors.platform}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">{t('version')}</Label>
              <Input
                id="version"
                name="version"
                value={formik.values.version}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t('enter-version')}
              />
              {formik.touched.version && formik.errors.version && (
                <p className="text-sm text-destructive">
                  {formik.errors.version}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shard">{t('shard')}</Label>
              <Input
                id="shard"
                name="shard"
                value={formik.values.shard}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t('enter-shard')}
              />
              {formik.touched.shard && formik.errors.shard && (
                <p className="text-sm text-destructive">
                  {formik.errors.shard}
                </p>
              )}
            </div>
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
