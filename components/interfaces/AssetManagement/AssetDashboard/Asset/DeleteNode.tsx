import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
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

      if (values.confirm === 'DELETE NODE') {
        await deleteNode(fleetTeamId, nodeId)
        toast.loading(t('Delete Node'));
        formik.resetForm();
        setVisible(false);
        mutateNodes();
      } else {
        toast.error(t('Type confirmation text'));
      }

    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="DELETE">
        <Modal.Header className="font-bold">{`Confirm Permanent Asset Delete?`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p className='text-xs'>{t('asset')}: <span className='text-orange-400'>{nodeId}</span></p>
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

export default DeleteNode;
