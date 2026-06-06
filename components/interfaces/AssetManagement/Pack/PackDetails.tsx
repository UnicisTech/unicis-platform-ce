'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@/generated/client';
import { PLATFORMS } from '@/lib/fleet/constants';
import { useGetPackId } from '@/hooks/fleets/packs/useGetPackId';
import { useUpdatePack } from '@/hooks/fleets/packs/useUpdatePack';
import toast from 'react-hot-toast';
import DeletePack from './DeletePack';
import FleetConnectRequired from '../FleetConnectRequired';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';

interface FormData {
  name: string;
  platform: string;
  version: string;
  shard: string;
  description?: string;
}

const PackDetails = ({
  fleetTeamId,
  packID,
  user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  packID: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug } = router.query as { slug?: string };
  const { canAccess } = useCanAccess(slug);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);

  const { pack, isLoading, isError } = useGetPackId(fleetTeamId, packID);
  const updatePack = useUpdatePack();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('required')),
    platform: Yup.string().required(t('required')),
    version: Yup.string().required(t('required')),
    shard: Yup.string().required(t('required')),
    description: Yup.string().optional(),
  });

  const formik = useFormik<FormData>({
    enableReinitialize: true,
    initialValues: {
      name: pack?.name || '',
      platform: pack?.platform || PLATFORMS[0].value,
      version: pack?.version || '',
      shard: pack?.shard?.toString() || '',
      description: pack?.description || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updatePack(fleetTeamId, values, packID);
        toast.success(t('success'));
        setIsFormChanged(false);
      } catch {
        toast.error(t('error-updating-pack'));
      }
    },
  });

  const openDeleteModal = async (id: string) => {
    setPackToDelete(id);
    setDeleteVisible(true);
  };

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <FleetConnectRequired user={user} teamId={fleetTeamId}>
      {() => (
        <div className="space-y-4">
          <form
            onSubmit={formik.handleSubmit}
            onChange={checkFormChanges}
            className="flex flex-col gap-6 max-w-xl"
          >
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                placeholder={t('enter-name')}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500">{formik.errors.name}</p>
              )}
            </div>

            {/* Platform */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="platform">{t('platform')}</Label>
              <Select
                value={formik.values.platform}
                onValueChange={(value) =>
                  formik.setFieldValue('platform', value)
                }
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
                <p className="text-sm text-red-500">{formik.errors.platform}</p>
              )}
            </div>

            {/* Version + Shard */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="version">{t('version')}</Label>
                <Input
                  id="version"
                  name="version"
                  value={formik.values.version}
                  onChange={formik.handleChange}
                  placeholder={t('enter-version')}
                />
                {formik.touched.version && formik.errors.version && (
                  <p className="text-sm text-red-500">
                    {formik.errors.version}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="shard">{t('shard')}</Label>
                <Input
                  id="shard"
                  name="shard"
                  value={formik.values.shard}
                  onChange={formik.handleChange}
                  placeholder={t('enter-shard')}
                />
                {formik.touched.shard && formik.errors.shard && (
                  <p className="text-sm text-red-500">{formik.errors.shard}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {canAccess('team_fleet_pack', ['update']) && (
                <Button
                  type="submit"
                  variant="default"
                  disabled={!isFormChanged || formik.isSubmitting}
                >
                  {t('save-changes')}
                </Button>
              )}
              {canAccess('team_fleet_pack', ['delete']) && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => openDeleteModal(pack?.id ?? '')}
                >
                  {t('delete')}
                </Button>
              )}
            </div>
          </form>

          {/* Delete Modal */}
          <DeletePack
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            packId={packToDelete!}
            fleetTeamId={fleetTeamId}
          />
        </div>
      )}
    </FleetConnectRequired>
  );
};

export default PackDetails;
