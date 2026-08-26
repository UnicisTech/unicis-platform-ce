'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@/generated/client';
import {
  DEFAULT_FLEET_CONFIG_SHARD,
  DEFAULT_FLEET_CONFIG_VERSION,
} from '@/lib/fleet/constants';
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

interface FormData {
  name: string;
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
    description: Yup.string().optional(),
  });

  const formik = useFormik<FormData>({
    enableReinitialize: true,
    initialValues: {
      name: pack?.name || '',
      description: pack?.description || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updatePack(
          fleetTeamId,
          {
            ...values,
            platform: pack?.platform || 'all',
            version: pack?.version || DEFAULT_FLEET_CONFIG_VERSION,
            shard: pack?.shard || DEFAULT_FLEET_CONFIG_SHARD,
          },
          packID
        );
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
            className="flex w-full flex-col gap-6"
          >
            <div className="flex max-w-xl flex-col gap-6">
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
                  <p className="text-sm text-destructive">
                    {formik.errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <div>
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
              {canAccess('team_fleet_pack', ['update']) && (
                <Button
                  type="submit"
                  variant="default"
                  disabled={!isFormChanged || formik.isSubmitting}
                >
                  {t('save-changes')}
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
