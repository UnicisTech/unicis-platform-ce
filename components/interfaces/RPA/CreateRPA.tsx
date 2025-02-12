import React, { useState, useCallback, useEffect } from 'react';
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
import CreateFormBody from './CreateFormBody';
import { StageTracker } from '@/components/shared/atlaskit';
import { headers } from '@/components/defaultLanding/data/configs/rpa';

const CreateRPA = ({
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

  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [procedure, setProcedure] = useState<any[]>([]);
  const [prevProcedure, setPrevProcedure] = useState<any[]>([]);

  const cleanup = useCallback((reset: any) => {
    setProcedure([]);
    setStage(0);
    reset();
  }, []);

  const saveProcedure = useCallback(
    async (procedure: any[], prevProcedure: any[], reset: any) => {
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
    [prevProcedure]
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
    [stage, procedure, prevProcedure]
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

  useEffect(() => {
    const taskProperties = task.properties as any;
    if (taskProperties?.rpa_procedure) {
      setProcedure(taskProperties.rpa_procedure);
      setPrevProcedure([...taskProperties.rpa_procedure]);
    }
  }, []);

  return (
    <Modal open={visible} className="w-11/12 max-w-3xl">
      <Form onSubmit={onSubmit}>
        {({ formProps, reset }) => (
          <form {...formProps}>
            <Modal.Header>
              <StageTracker currentStage={stage} headers={headers} />
            </Modal.Header>
            <Modal.Body>
              <CreateFormBody
                stage={stage}
                validationMessage={validationMessage}
                procedure={procedure}
              />
            </Modal.Body>
            <Modal.Actions>
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
            </Modal.Actions>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default CreateRPA;
