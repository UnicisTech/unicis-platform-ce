import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useDeleteNode } from '@/hooks/fleets/Nodes/useDeleteNode';

const ExportNode = ({
  nodeId,
  visible,
  setVisible,
  fleetTeamId,
  fleetAccessPhrase
}: {
  nodeId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
  fleetAccessPhrase: string;
}) => {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');

  const deleteNode = useDeleteNode();

  const formik = useFormik({
    initialValues: {
      name: '',
      pdf: false,
      csv: false,
      relatives: false,
    },
    onSubmit: async (values) => {

      await deleteNode(fleetTeamId, nodeId, fleetAccessPhrase)
      toast.loading(t('Exported Node'));
      formik.resetForm();
      setVisible(false);

    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">{`Export Node`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
          </div>
          <InputWithLabel
            type="text"
            label={t('File Name')}
            name="name"
            placeholder={t('Enter file name')}
            value={formik.values.name}
            error={
              formik.touched.name
                ? formik.errors.name
                : undefined
            }
            required
            onChange={formik.handleChange}
          />
          <div className='grid grid-cols-2'>
            <InputWithLabel
              type="radio"
              label={t('As PDF')}
              name="pdf"
              checked={formik.values.pdf}
              onChange={formik.handleChange}
            />
            <InputWithLabel
              type="radio"
              label={t('As CSV')}
              name="csv"
              checked={formik.values.csv}
              onChange={formik.handleChange}
            />
          </div>
          <InputWithLabel
            type="check"
            label={t('Include Relatives')}
            name="relatives"
            onChange={formik.handleChange}
          />
          
          <span className='text-xs'>{t('fleet-export-node-description')}</span>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            {t('export')}
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

export default ExportNode;
