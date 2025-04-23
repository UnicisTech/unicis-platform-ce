import React, { useState, useCallback } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';
import type { ApiResponse, TeamCourseWithProgress } from 'types';

const DeleteCourse = ({
  visible,
  setVisible,
  teamCourse,
  mutate,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  teamCourse: TeamCourseWithProgress;
  mutate: () => Promise<void>;
}) => {
  const course = teamCourse.course;
  const { t } = useTranslation('common');

  const router = useRouter();
  const { slug } = router.query;

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCourse = useCallback(async () => {
    try {
      setIsDeleting(true);

      const response = await axios.delete<ApiResponse<any>>(
        `/api/teams/${slug}/iap/course/${teamCourse.id}`
      );

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      } else {
        toast.success(t('iap-course-deleted'));
      }

      mutate();

      setIsDeleting(false);
      setVisible(false);
    } catch (error: any) {
      setIsDeleting(false);
      toast.error(getAxiosError(error));
    }
  }, [course]);

  const closeHandler = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <Modal open={visible}>
      <Form onSubmit={() => {}}>
        {({ formProps }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">Delete course</Modal.Header>
            <Modal.Body>
              <div style={{ margin: '1.5rem 0' }}>
                <p>Are you sure you want to delete course?</p>
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
                onClick={deleteCourse}
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

export default DeleteCourse;
