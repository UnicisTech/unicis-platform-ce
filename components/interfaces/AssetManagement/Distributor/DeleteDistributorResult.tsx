import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useDeleteDistributed } from '@/hooks/fleets/distributors/useDeleteDistributor';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';

const DeleteDistributors = ({
  distributorId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  distributorId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');
  const deleteDistributor = useDeleteDistributed();
  const { mutateDistributorsTasks } = useDistributors(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values) => {

      if (values.confirm.toLowerCase() === 'DELETE'.toLowerCase()) {
        toast.loading(t('deleted'));
        await deleteDistributor(fleetTeamId, distributorId);
        formik.resetForm();
        mutateDistributorsTasks();
        setVisible(false);
      } else {
        toast.error(t('Type confirmation text'));
      }

    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="DELETE">
        <Modal.Header className="font-bold">{`Confirm Permanent Script Delete?`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p className='text-xs'>{t('script')}: <span className='text-orange-400'>{distributorId}</span></p>
            <p>{t('fleet-delete-warning')}</p>
          </div>
          <InputWithLabel
            type="text"
            label={t('confirm')}
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
          <span className='text-xs'>{t('fleet-delete-description')}</span>
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

export default DeleteDistributors;
