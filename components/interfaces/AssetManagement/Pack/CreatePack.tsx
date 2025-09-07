import React, { useRef, useState } from 'react';
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/shadcn/ui/select';
import TagsSelector from '../TagsSelector';
import { PLATFORMS } from "@/lib/fleet/constants";
import { useCreatePack } from '@/hooks/fleets/packs/useCreatePack';
import { usePacks } from '@/hooks/fleets/packs/usePacks';
import type { User } from '@prisma/client';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface Option {
  label: string;
  value: string;
}

const DEFAULT_PLATFORM_VALUE = 'all';

const CreatePack = ({
  visible,
  setVisible,
  user,
  fleetTeamId
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
      platform: DEFAULT_PLATFORM_VALUE,
      version: '',
      shard: '',
      description: '',
      tags: [] as string[],
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t('Name is required')),
      platform: Yup.string().required(t('Platform is required')),
      version: Yup.string().required(t('Version is required')),
      shard: Yup.string().required(t('Shard is required')),
    }),
    onSubmit: async (values) => {
      try {
        const packData = {
          ...values,
          tags: selectedTags.join(','),
        };
        await createPack(fleetTeamId, packData);
        toast.success(t('success'));
        mutatePacks();
        setVisible(false);
      } catch (err) {
        toast.error(t('error'));
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t('Create Pack')}</DialogTitle>
            <DialogDescription>{t('Fill in the details to create a new pack')}</DialogDescription>
          </DialogHeader>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t('Name')}</label>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              placeholder={t('Enter pack name')}
            />
            {formik.touched.name && formik.errors.name && (
              <span className="text-sm text-red-500">{formik.errors.name}</span>
            )}
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t('Platform')}</label>
            <Select
              value={formik.values.platform}
              onValueChange={(value) => formik.setFieldValue('platform', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Select platform')} />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((option: Option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.platform && formik.errors.platform && (
              <span className="text-sm text-red-500">{formik.errors.platform}</span>
            )}
          </div>

          {/* Version & Shard */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{t('Version')}</label>
              <Input
                name="version"
                value={formik.values.version}
                onChange={formik.handleChange}
                placeholder={t('Enter version')}
              />
              {formik.touched.version && formik.errors.version && (
                <span className="text-sm text-red-500">{formik.errors.version}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{t('Shard')}</label>
              <Input
                name="shard"
                value={formik.values.shard}
                onChange={formik.handleChange}
                placeholder={t('Enter shard')}
              />
              {formik.touched.shard && formik.errors.shard && (
                <span className="text-sm text-red-500">{formik.errors.shard}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t('Description')}</label>
            <ReactQuill
              theme="snow"
              value={formik.values.description}
              onChange={(value) => formik.setFieldValue('description', value)}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t('Tags')}</label>
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
            <Button
              type="submit"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? t('Creating...') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePack;
