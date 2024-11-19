import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useDeleteTag } from '@/hooks/fleets/Tags/useDeleteTag';
import { useTags } from '@/hooks/fleets/Tags/useTags';

const DeleteTag = ({
  tagId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  tagId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation('common');

  const deleteTag = useDeleteTag();
  const { mutateTags } = useTags(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      confirm: '',
    },
    onSubmit: async (values) => {

      if (values.confirm.toLowerCase() === 'DELETE'.toLowerCase()) {
        await deleteTag(fleetTeamId, tagId)
        toast.loading(t('Delete Tag'));
        mutateTags();
        setVisible(false);
        formik.resetForm();
      } else {
        toast.error(t('Type confirmation text'));
      }

    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="DELETE">
        <Modal.Header className="font-bold">{`Confirm Permanent Tag Delete?`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p className='text-xs'>{t('tag')}: <span className='text-orange-400'>{tagId}</span></p>
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

export default DeleteTag;
