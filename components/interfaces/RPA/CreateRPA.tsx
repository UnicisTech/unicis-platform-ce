import React, { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "react-daisyui";
import { useTranslation } from "next-i18next";
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';

import type { ApiResponse, TeamMemberWithUser, TaskWithRpaProcedure, RpaOption } from "types";
import type { Task } from "@prisma/client";
import CreateFormBody from "./CreateFormBody";

const CreateRPA = ({
  visible,
  setVisible,
  task,
  members,
  mutate
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task | TaskWithRpaProcedure;
  members: TeamMemberWithUser[] | null | undefined;
  mutate: () => Promise<void>
}) => {
  const { t } = useTranslation("common");

  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [procedure, setProcedure] = useState<any[]>([]);
  const [prevProcedure, setPrevProcedure] = useState<any[]>([])

  const cleanup = useCallback((reset: any) => {
    setProcedure([])
    setStage(0)
    reset()
  }, [])

  const saveProcedure = useCallback(async (procedure: any[], prevProcedure: any[], reset: any) => {
    setIsLoading(true)

    const response = await axios.post<ApiResponse<Task>>(`/api/tasks/${task.id}/rpa`, {
      prevProcedure: prevProcedure,
      nextProcedure: procedure,
    });

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    } else {
      toast.success(t("rpa-created"));
    }

    mutate()

    setIsLoading(false)
    setVisible(false)

    cleanup(reset)
  }, [prevProcedure])

  const validate = useCallback((formData: any) => {
    if (formData.reviewDate != null) {
      let date = new Date();
      date.setHours(0, 0, 0, 0);
      if (new Date(formData.reviewDate) <= date) {
        return "Review Date must not be in the past";
      }
    }
    return "";
  }, [])

  const onSubmit = useCallback(async (formData: any, { reset }: any) => {
    const message = validate(formData);

    if (procedure[stage] != null) {
      procedure[stage] = formData;
    } else {
      setProcedure([...procedure, formData]);
    }

    if (message !== "") {
      return setValidationMessage(message);
    }
    if (stage === 4) {
      const procedureToSave = procedure.length === 4 ? [...procedure, formData] : procedure
      await saveProcedure(procedureToSave, prevProcedure, reset)
    } else {
      setStage(stage + 1);
    }
  }, [stage, procedure, prevProcedure])

  const backHandler = useCallback(() => {
    if (stage > 0) {
      setStage(prev => prev - 1)
    }
  }, [stage])

  const closeHandler = useCallback((reset: any) => {
    setVisible(false)
    setProcedure([])
    cleanup(reset)
  }, [])

  useEffect(() => {
    const taskProperties = task.properties as any
    if (taskProperties?.rpa_procedure) {
      setProcedure(taskProperties.rpa_procedure)
      setPrevProcedure([...taskProperties.rpa_procedure])
    }
  }, [])

  return (
    <Modal open={visible}>
      <Form
        onSubmit={onSubmit}
      >
        {({ formProps, reset }) => (
          <form {...formProps}>
            <Modal.Header className="font-bold">{`Register Record of Processing Activities ${stage + 1}/5`}</Modal.Header>
            <Modal.Body>
              <CreateFormBody
                stage={stage}
                validationMessage={validationMessage}
                procedure={procedure}
                members={members}
              />
            </Modal.Body>
            <Modal.Actions>
              <AtlaskitButton
                appearance="default"
                onClick={() => closeHandler(reset)}
                isDisabled={isLoading}
              >
                {t("close")}
              </AtlaskitButton>
              <AtlaskitButton
                appearance="default"
                onClick={backHandler}
                isDisabled={stage === 0 || isLoading}
              >
                {t("back")}
              </AtlaskitButton>
              <LoadingButton
                type="submit"
                appearance="primary"
                isLoading={isLoading}
              >
                {stage < 4
                  ? t("next")
                  : t("save")
                }
              </LoadingButton>
            </Modal.Actions>
          </form>
        )}
      </Form>

    </Modal>
  );
};

export default CreateRPA;
