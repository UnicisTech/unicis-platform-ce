import React, { useState, useCallback } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';
import { useRouter } from 'next/router';
import type { ApiResponse, TaskWithRpaProcedure } from 'types';
import type { Task } from '@prisma/client';

const DeleteTia = ({
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

  const deleteProcedure = useCallback(async () => {
    try {
      setIsDeleting(true);

      const response = await axios.delete<ApiResponse<Task>>(
        `/api/teams/${slug}/tasks/${task.taskNumber}/tia`
      );

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      } else {
        toast.success('Procedure deleted.');
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
              Remove Transfer Impact Assessment
            </Modal.Header>
            <Modal.Body>
              <div style={{ margin: '1.5rem 0' }}>
                <p>
                  Are you sure you want to remove Transfer Impact Assessment?
                  Your task will not be removed.
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
                onClick={deleteProcedure}
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

export default DeleteTia;
