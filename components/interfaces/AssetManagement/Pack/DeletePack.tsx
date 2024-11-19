import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import { useDeletePack } from '@/hooks/fleets/packs/useDeletePack';
import { InputWithLabel } from '@/components/shared';
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

      if (values.confirm.toLowerCase() === 'DELETE'.toLowerCase()) {
        await deletePack(fleetTeamId, packId)
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
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="DELETE">
        <Modal.Header className="font-bold">{`Confirm Permanent Package Delete?`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p className='text-xs'>{t('package')}: <span className='text-orange-400'>{packId}</span></p>
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
          <span className='text-xs'>{t('fleet-delete-pack-description')}</span>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="error"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            {t('delete')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t('close')}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default DeletePack;
