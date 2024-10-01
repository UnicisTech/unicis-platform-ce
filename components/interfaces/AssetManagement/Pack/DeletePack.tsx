import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import useTasks from 'hooks/useTasks';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import { useDeletePack } from '@/hooks/fleets/packs/useDeletePack';
import { InputWithLabel } from '@/components/shared';

const DeletePack = ({
  packId,
  visible,
  setVisible,
  fleetTeamId,
  fleetAccessPhrase
}: {
  packId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
  fleetAccessPhrase: string;
}) => {
  const router = useRouter();
  const { slug } = router.query;
  const { mutateTasks } = useTasks(slug as string);
  const { t } = useTranslation('common');

  const deletePack = useDeletePack();

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: async (values) => {

      if (values.name === 'DELETE PACK') {
        await deletePack(fleetTeamId, packId, fleetAccessPhrase)
        toast.loading(t('Delete Pack'));
        mutateTasks();
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
        <Modal.Header className="font-bold">{`Delete pack`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('fleet-delete-pack-warning')}</p>
            <p className='text-gray-300 text-xs'>This is the confirm text <span className='text-orange-400'>DELETE PACK</span></p>
          </div>
          <InputWithLabel
            type="text"
            label={t('Confirm')}
            name="name"
            placeholder={t('Enter confirmation text')}
            value={formik.values.name}
            error={
              formik.touched.name
                ? formik.errors.name
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
