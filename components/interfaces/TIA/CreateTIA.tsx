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
import {
  defaultProcedure,
  headers,
} from '@/components/defaultLanding/data/configs/tia';
import CreateFormBody from './CreateFormBody';
import { StageTracker } from '@/components/shared/atlaskit';

const shouldSkipTwoSteps = (formData: any) =>
  [
    'LawfulAccess',
    'MassSurveillanceTelecommunications',
    'SelfReportingObligations',
  ]
    .map((prop) => ['yes', 'na'].includes(formData[prop]))
    .every((result) => result === true);

const CreateTIA = ({
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
  const [transferIs, setTransferIs] = useState<string>('PERMITTED');
  const [targetedRisk, setTargetedRisk] = useState<number>(0);
  const [nonTargetedRisk, setNonTargetedRisk] = useState<number>(0);
  const [selfReportingRisk, setSelfReportingRisk] = useState<number>(0);
  const [isPermitted, setIsPermitted] = useState<boolean>(true);

  const procedureFieldHandler = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: (name: string, value: any) => void,
      stage: number
    ) => {
      const { value, name } = e.target;
      setFieldValue(name, value);
      if (procedure[stage] != null) {
        const updatedProcedure = [...procedure];
        updatedProcedure[stage] = { ...updatedProcedure[stage], [name]: value };
        setProcedure(updatedProcedure);
      } else {
        setProcedure([...procedure, { [name]: value }]);
      }
    },
    [procedure]
  );

  useEffect(() => {
    if (procedure[1]) {
      const {
        EncryptionInTransit,
        TransferMechanism,
        LawfulAccess,
        MassSurveillanceTelecommunications,
        SelfReportingObligations,
      } = procedure[1];

      if (EncryptionInTransit === 'no' || TransferMechanism === 'no') {
        return setTransferIs('NOT PERMITTED');
      }

      if (
        LawfulAccess === 'no' ||
        MassSurveillanceTelecommunications === 'no' ||
        SelfReportingObligations === 'no'
      ) {
        return setTransferIs('PERMITTED, SUBJECT TO STEP 4');
      }

      setTransferIs('PERMITTED');
    }
  }, [procedure]);

  useEffect(() => {
    if (procedure[2]) {
      const {
        WarrantsSubpoenas,
        ViolationLocalLaw,
        HighViolationLocalLaw,
        HighViolationDataIssue,
        InvestigatingImporter,
        PastWarrantSubpoena,

        LocalIssueWarrants,
        LocalMassSurveillance,
        LocalAccessMassSurveillance,
        LocalRoutinelyMonitor,
        PassMassSurveillance,

        ImporterObligation,
        LocalSelfReporting,
        PastSelfReporting,
      } = procedure[2];

      const targetedRisk =
        Number(WarrantsSubpoenas) +
        Number(ViolationLocalLaw) +
        Number(HighViolationLocalLaw) +
        Number(HighViolationDataIssue) +
        Number(InvestigatingImporter) +
        Number(PastWarrantSubpoena);
      const nonTargetedRisk =
        Number(LocalIssueWarrants) +
        Number(LocalMassSurveillance) +
        Number(LocalAccessMassSurveillance) +
        Number(LocalRoutinelyMonitor) +
        Number(PassMassSurveillance);
      const selfReportingRisk =
        Number(ImporterObligation) +
        Number(LocalSelfReporting) +
        Number(PastSelfReporting);

      setTargetedRisk(targetedRisk);
      setNonTargetedRisk(nonTargetedRisk);
      setSelfReportingRisk(selfReportingRisk);
    }
  }, [procedure]);

  useEffect(() => {
    if (procedure[1]) {
      const {
        EncryptionInTransit,
        TransferMechanism,
        LawfulAccess,
        MassSurveillanceTelecommunications,
        SelfReportingObligations,
      } = procedure[1];

      const {
        ConnectionTargetedAccess,
        ConnectionSurveillanceTele,
        ConnectionSelfreportingObligations,
      } = procedure[3];

      if (EncryptionInTransit === 'no' || TransferMechanism === 'no') {
        return setIsPermitted(false);
      }

      if (LawfulAccess === 'no' && ConnectionTargetedAccess === 'yes') {
        return setIsPermitted(false);
      }

      if (
        MassSurveillanceTelecommunications === 'no' &&
        ConnectionSurveillanceTele === 'yes'
      ) {
        return setIsPermitted(false);
      }

      if (
        SelfReportingObligations === 'no' &&
        ConnectionSelfreportingObligations === 'yes'
      ) {
        return setIsPermitted(false);
      }

      setIsPermitted(true);
    }
  }, [procedure]);

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
          `/api/teams/${slug}/tasks/${task.taskNumber}/tia`,
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
          toast.success(t('tia-created'));
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
        procedure[stage] = { ...procedure[stage], ...formData };
      } else {
        setProcedure([...procedure, formData]);
      }

      if (stage === 1 && shouldSkipTwoSteps(formData)) {
        return setStage(stage + 3);
      }

      if (message !== '') {
        return setValidationMessage(message);
      }
      if (stage === 4) {
        await saveProcedure(procedure, prevProcedure, reset);
      } else {
        setStage(stage + 1);
      }
    },
    [stage, procedure, prevProcedure]
  );

  const backHandler = useCallback(() => {
    if (stage > 0) {
      if (stage === 4 && shouldSkipTwoSteps(procedure[1])) {
        setStage((prev) => prev - 3);
      } else {
        setStage((prev) => prev - 1);
      }
    }
  }, [stage, procedure]);

  const closeHandler = useCallback((reset: (initialValues?: any) => void) => {
    setVisible(false);
    setProcedure(defaultProcedure);
    setStage(0);
    reset();
  }, []);

  useEffect(() => {
    const taskProperties = task.properties as any;
    if (taskProperties?.tia_procedure) {
      setProcedure(taskProperties.tia_procedure);
      setPrevProcedure([...taskProperties.tia_procedure]);
    } else {
      setProcedure(defaultProcedure);
    }
  }, []);

  return (
    <Modal open={visible}>
      <Form onSubmit={onSubmit}>
        {(props) => {
          const { formProps, reset, setFieldValue } = props;
          return (
            <form {...formProps}>
              <Modal.Header className="font-bold">
                <StageTracker currentStage={stage} headers={headers} />
              </Modal.Header>
              <Modal.Body>
                <CreateFormBody
                  stage={stage}
                  validationMessage={validationMessage}
                  procedure={procedure}
                  transferIs={transferIs}
                  targetedRisk={targetedRisk}
                  nonTargetedRisk={nonTargetedRisk}
                  selfReportingRisk={selfReportingRisk}
                  isPermitted={isPermitted}
                  procedureFieldHandler={procedureFieldHandler}
                  setFieldValue={setFieldValue}
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
                  {stage < 4 ? t('next') : t('save')}
                </LoadingButton>
              </Modal.Actions>
            </form>
          );
        }}
      </Form>
    </Modal>
  );
};

export default CreateTIA;
