'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/shadcn/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import TaskPicker from '@/components/shared/shadcn/TaskPicker';
import { Loader2 } from 'lucide-react';

import type { ApiResponse, RMProcedureInterface } from 'types';
import type { Task } from '@prisma/client';
import { useRiskAndImpactStepForm, useRiskTreatmentStepForm } from './hooks';
import { RiskAndImpactStep, RiskTreatmentStep } from './steps';
import { StageTracker } from '@/components/shared/atlaskit';
import { headers } from '@/components/defaultLanding/data/configs/rm';

interface RmRiskDialogProps {
  prevRisk?: RMProcedureInterface;
  selectedTask?: Task;
  tasks?: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completeCallback?: () => void;
  mutateTasks: () => Promise<void>;
}

export default function RmRiskDialog({
  prevRisk,
  selectedTask,
  tasks,
  open,
  onOpenChange,
  completeCallback,
  mutateTasks,
}: RmRiskDialogProps) {
  const { t } = useTranslation('common');

  const router = useRouter();
  const { slug } = router.query;

  const [currentStep, setCurrentStep] = React.useState(selectedTask ? 1 : 0);
  const [riskData, setRiskData] = React.useState<any>(prevRisk || []);
  const [task, setTask] = React.useState<Task | null>(selectedTask || null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const taskForm = useForm<{ task: Task }>({ mode: 'onChange' });
  const riskAndImpactForm = useRiskAndImpactStepForm(riskData);
  const riskTreatmentForm = useRiskTreatmentStepForm(riskData);

  const next = () => {
    if (currentStep === 0) {
      taskForm.handleSubmit(({ task }) => {
        setTask(task);
        setCurrentStep(1);
        setRiskData([]);
      })();
    } else if (currentStep === 1) {
      riskAndImpactForm.handleSubmit((data) => {
        const riskToSave = [...riskData];
        riskToSave[0] = data;
        setRiskData(riskToSave);
        setCurrentStep(2);
      })();
    } else if (currentStep === 2) {
      riskTreatmentForm.handleSubmit((data) => {
        const riskToSave = [...riskData];
        riskToSave[1] = data;
        setRiskData(riskToSave);
        handleSubmit(riskToSave, prevRisk);
      })();
    }
  };

  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (risk: any, prevRisk?: any) => {
    try {
      setIsSaving(true);
      if (!task) {
        return;
      }

      const response = await axios.post<ApiResponse<Task>>(
        `/api/teams/${slug}/tasks/${task.taskNumber}/rm`,
        {
          prevRisk: prevRisk || [],
          nextRisk: risk,
        }
      );

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      } else {
        toast.success(t('rm-created'));
      }

      completeCallback?.();
      mutateTasks();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Unexpected error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{t('rm')}</DialogTitle>
          {currentStep > 0 && (
            <StageTracker headers={headers} currentStage={currentStep - 1} />
          )}
        </DialogHeader>

        <div className="max-w-md">
          {currentStep === 0 && tasks && (
            <Form {...taskForm}>
              <form className="space-y-4">
                <TaskPicker
                  control={taskForm.control}
                  name="task"
                  tasks={tasks.filter(
                    (task) => !(task.properties as any)?.rm_risk
                  )}
                />
              </form>
            </Form>
          )}

          {currentStep === 1 && (
            <Form {...riskAndImpactForm}>
              <RiskAndImpactStep control={riskAndImpactForm.control} />
            </Form>
          )}

          {currentStep === 2 && (
            <Form {...riskTreatmentForm}>
              <RiskTreatmentStep control={riskTreatmentForm.control} />
            </Form>
          )}
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">{t('close')}</Button>
          </DialogClose>
          {currentStep > 0 && (
            <Button variant="outline" onClick={back}>
              {t('back')}
            </Button>
          )}
          <Button onClick={next} disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" />}
            {currentStep < 2 ? t('next') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
