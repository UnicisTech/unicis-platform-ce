import React from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal, Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import type { ApiResponse } from 'types';
import useTasks from 'hooks/useTasks';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';

const DeleteTask = ({
  taskNumber,
  visible,
  setVisible,
}: {
  taskNumber: null | number;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const router = useRouter();
  const { slug } = router.query;
  const { mutateTasks } = useTasks(slug as string);
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: async () => {
      const response = await axios.delete<ApiResponse<unknown>>(
        `/api/teams/${slug}/tasks/${taskNumber}`
      );

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('task-deleted'));

      mutateTasks();
      formik.resetForm();
      setVisible(false);
    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">{`Delete task`}</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('delete-task-warning')}</p>
          </div>
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

export default DeleteTask;
