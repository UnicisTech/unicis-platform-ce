import React from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import useTasks from 'hooks/useTasks';
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
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');

  const deleteTag = useDeleteTag();
  const { mutateTags } = useTags(fleetTeamId);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: async (values) => {

      if (values.name === 'DELETE TAG') {
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
        <Modal.Header className="font-bold">{`Delete tag`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('fleet-delete-tag-warning')}</p>
            <p className='text-gray-300 text-xs'>This is the confirm text <span className='text-orange-400'>DELETE TAG</span></p>
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
          <span className='text-xs'>{t('fleet-delete-tag-description')}</span>
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
