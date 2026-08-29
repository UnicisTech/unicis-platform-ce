import React, { useState } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import TagsSelector from '../TagsSelector';
import {
  DEFAULT_FLEET_CONFIG_SHARD,
  DEFAULT_FLEET_CONFIG_VERSION,
} from '@/lib/fleet/constants';
import { useCreatePack } from '@/hooks/fleets/packs/useCreatePack';
import { usePacks } from '@/hooks/fleets/packs/usePacks';
import type { User } from '@/generated/client';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'quill/dist/quill.snow.css';

const DEFAULT_PLATFORM_VALUE = 'all';

const CreatePack = ({
  visible,
  setVisible,
  user: _user,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  user: Partial<User>;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const createPack = useCreatePack();
  const { mutatePacks } = usePacks(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      tags: [] as string[],
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t('name-required')),
    }),
    onSubmit: async (values) => {
      try {
        const packData = {
          ...values,
          platform: DEFAULT_PLATFORM_VALUE,
          version: DEFAULT_FLEET_CONFIG_VERSION,
          shard: DEFAULT_FLEET_CONFIG_SHARD,
          tags: selectedTags.join(','),
        };
        await createPack(fleetTeamId, packData);
        toast.success(t('success'));
        mutatePacks();
        setVisible(false);
      } catch {
        toast.error(t('error'));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t('create-pack')}</DialogTitle>
            <DialogDescription>{t('fill-create-pack')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t('name')}</label>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              placeholder={t('enter-pack-name')}
            />
            {formik.touched.name && formik.errors.name && (
              <span className="text-sm text-destructive">
                {formik.errors.name}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 mb-10">
            <label className="text-sm font-medium">{t('description')}</label>
            <ReactQuill
              theme="snow"
              value={formik.values.description}
              onChange={(value) => formik.setFieldValue('description', value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t('tags')}</label>
            <TagsSelector
              fleetTeamId={fleetTeamId}
              setSectionTag={setSelectedTags}
              onSelect={() => {}}
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePack;
