import React, { useState, useCallback, useMemo } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';

import type { ApiResponse } from 'types';

import type { Task } from '@prisma/client';
import CreateFormBody from './CreateFormBody';
import { TaskPickerFormBody } from '@/components/shared/atlaskit';
import { StageTracker } from '@/components/shared/atlaskit';
import { headers } from '@/components/defaultLanding/data/configs/rpa';

const DashboardCreateRPA = ({
  visible,
  setVisible,
  tasks,
  mutate,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  tasks: Array<Task>;
  mutate: () => Promise<void>;
}) => {
  const { t } = useTranslation('common');

  const router = useRouter();
  const { slug } = router.query;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalStage, setModalStage] = useState(0);
  const [stage, setStage] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [procedure, setProcedure] = useState<any[]>([]);
  const [prevProcedure] = useState<any[]>([]);

  const tasksWithoutProcedures = useMemo<Array<Task>>(() => {
    if (!tasks) {
      return [];
    }
    return tasks.filter((task) => {
      const taskProperties = task.properties as any;
      const procedure = taskProperties.rpa_procedure;
      return !procedure;
    }) as Task[];
  }, [tasks]);

  const cleanup = useCallback((reset: any) => {
    setProcedure([]);
    setStage(0);
    reset();
  }, []);

  const saveProcedure = useCallback(
    async (procedure: any[], prevProcedure: any[], reset: any) => {
      if (!task) {
        return;
      }

      try {
        setIsLoading(true);

        const response = await axios.post<ApiResponse<Task>>(
          `/api/teams/${slug}/tasks/${task.taskNumber}/rpa`,
          {
            prevProcedure: prevProcedure,
            nextProcedure: procedure,
          }
        );

        const { error } = response.data;

        if (error) {
          toast.error(error.message);
          return;
        } else {
          toast.success(t('rpa-created'));
        }

        mutate();

        setIsLoading(false);
        setVisible(false);

        cleanup(reset);
      } catch (error: any) {
        setIsLoading(false);
        toast.error(getAxiosError(error));
      }
    },
    [prevProcedure, task]
  );

  const validate = useCallback((formData: any) => {
    if (formData.reviewDate != null) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      if (new Date(formData.reviewDate) <= date) {
        return 'Review Date must not be in the past';
      }
    }
    return '';
  }, []);

  const onSubmit = useCallback(
    async (formData: any, { reset }: any) => {
      console.log('onsubmit click');
      if (modalStage === 0) {
        const task = formData.task.value;
        setTask(task);
        setModalStage(1);
        console.log('formData in satge 0 ', formData);
        return;
      }
      const message = validate(formData);

      if (procedure[stage] != null) {
        procedure[stage] = formData;
      } else {
        setProcedure([...procedure, formData]);
      }

      if (message !== '') {
        return setValidationMessage(message);
      }
      if (stage === 5) {
        const procedureToSave =
          procedure.length === 5 ? [...procedure, formData] : procedure;
        await saveProcedure(procedureToSave, prevProcedure, reset);
      } else {
        setStage(stage + 1);
      }
    },
    [stage, procedure, prevProcedure, modalStage]
  );

  const backHandler = useCallback(() => {
    if (stage > 0) {
      setStage((prev) => prev - 1);
    }
  }, [stage]);

  const closeHandler = useCallback((reset: any) => {
    setVisible(false);
    setProcedure([]);
    cleanup(reset);
  }, []);

  return (
    <Modal open={visible} className="w-11/12 max-w-3xl">
      <Form onSubmit={onSubmit}>
        {({ formProps, reset }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">
              {modalStage === 0 && `Select a task`}
              {modalStage === 1 && (
                <StageTracker currentStage={stage} headers={headers} />
              )}
            </Modal.Header>
            <Modal.Body>
              {modalStage === 0 && (
                <TaskPickerFormBody tasks={tasksWithoutProcedures} />
              )}
              {modalStage === 1 && (
                <CreateFormBody
                  stage={stage}
                  validationMessage={validationMessage}
                  procedure={procedure}
                />
              )}
            </Modal.Body>
            <Modal.Actions>
              {modalStage === 0 && (
                <>
                  <AtlaskitButton
                    appearance="default"
                    onClick={() => closeHandler(reset)}
                    isDisabled={isLoading}
                  >
                    {t('close')}
                  </AtlaskitButton>
                  <LoadingButton
                    type="submit"
                    appearance="primary"
                    isLoading={isLoading}
                  >
                    {t('next')}
                  </LoadingButton>
                </>
              )}
              {modalStage === 1 && (
                <>
                  <AtlaskitButton
                    appearance="default"
                    onClick={() => closeHandler(reset)}
                    isDisabled={isLoading}
                  >
                    {t('close')}
                  </AtlaskitButton>
                  <AtlaskitButton
                    appearance="default"
                    onClick={backHandler}
                    isDisabled={stage === 0 || isLoading}
                  >
                    {t('back')}
                  </AtlaskitButton>
                  <LoadingButton
                    type="submit"
                    appearance="primary"
                    isLoading={isLoading}
                  >
                    {stage < 5 ? t('next') : t('save')}
                  </LoadingButton>
                </>
              )}
            </Modal.Actions>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default DashboardCreateRPA;
