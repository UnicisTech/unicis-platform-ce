import React, { useState, useCallback } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';
import type { ApiResponse, TaskWithRpaProcedure } from 'types';
import type { Task } from '@prisma/client';

const DeleteRisk = ({
  visible,
  setVisible,
  task,
  mutate,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task | TaskWithRpaProcedure;
  mutate: () => Promise<void>;
}) => {
  const { t } = useTranslation('common');

  const router = useRouter();
  const { slug } = router.query;

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRisk = useCallback(async () => {
    try {
      setIsDeleting(true);

      const response = await axios.delete<ApiResponse<Task>>(
        `/api/teams/${slug}/tasks/${task.taskNumber}/rm`
      );

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      } else {
        toast.success('Risk deleted.');
      }

      mutate();

      setIsDeleting(false);
      setVisible(false);
    } catch (error: any) {
      setIsDeleting(false);
      toast.error(getAxiosError(error));
    }
  }, [task]);

  const closeHandler = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <Modal open={visible}>
      <Form onSubmit={() => {}}>
        {({ formProps }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">
              Remove Risk Management
            </Modal.Header>
            <Modal.Body>
              <div style={{ margin: '1.5rem 0' }}>
                <p>
                  Are you sure you want to remove Risk Management record from
                  the task? Your task will not be removed.
                </p>
              </div>
            </Modal.Body>
            <Modal.Actions>
              <AtlaskitButton
                appearance="default"
                onClick={() => closeHandler()}
                isDisabled={isDeleting}
              >
                {t('close')}
              </AtlaskitButton>
              <LoadingButton
                onClick={deleteRisk}
                appearance="primary"
                isLoading={isDeleting}
              >
                {t('delete')}
              </LoadingButton>
            </Modal.Actions>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default DeleteRisk;
