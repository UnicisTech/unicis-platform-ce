import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import useTasks from 'hooks/useTasks';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import DaisyModal from '@/components/shared/daisyUI/DaisyModal';

//TODO: move visible to parent component
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
      const res = await fetch(`/api/teams/${slug}/tasks/${taskNumber}`, {
        method: 'DELETE',
      });

      const { error } = await res.json();
      if (!res.ok || error) {
        toast.error(error?.message || 'Request failed');
        return;
      }

      toast.success(t('task-deleted'));
      mutateTasks();
      formik.resetForm();
      setVisible(false);
    },
  });

  return (
    <DaisyModal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <DaisyModal.Header className="font-bold">{`Delete task`}</DaisyModal.Header>
        <DaisyModal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('delete-task-warning')}</p>
          </div>
        </DaisyModal.Body>
        <DaisyModal.Actions>
          <DaisyButton
            type="submit"
            color="error"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            {t('delete')}
          </DaisyButton>
          <DaisyButton
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t('close')}
          </DaisyButton>
        </DaisyModal.Actions>
      </form>
    </DaisyModal>
  );
};

export default DeleteTask;
