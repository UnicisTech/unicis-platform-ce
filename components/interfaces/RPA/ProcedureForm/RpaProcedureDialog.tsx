import * as React from "react";
import toast from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm } from "react-hook-form";
import {
    Form
} from "@/components/shadcn/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Loader2 } from "lucide-react"
import { Task } from "@prisma/client";
import { ApiResponse, defaultProcedure, ProcedureQueueItem, RpaProcedureInterface } from "types";
import TaskPicker from "@/components/shared/shadcn/TaskPicker";
import { Message } from "@/components/shared";
import { useDescriptionAndStakeholdersStepForm, usePurposeAndCategoriesStepForm, useRecipientsStepForm, useSecurityMeasuresStepForm, useTiaStepForm } from "./hooks";
import { DescriptionAndStakeholdersStep, PurposeAndCategoriesStep, RecipientsStep, TiaStep } from "./steps";
import { SecurityMeasuresStep } from "./steps/SecurityMeasuresStep";
import { usePiaStepForm } from "./hooks/usePiaStepForm";
import { PiaStep } from "./steps/PiaStep";

const createProceduresQueue = (procedure: any): ProcedureQueueItem[] => {
    const result: ProcedureQueueItem[] = [];
  
    if (procedure[3].datatransfer) result.push('TIA');
    if (procedure[5]?.piaNeeded === 'yes') result.push('PIA');

    return result;
  };

interface RpaProcedureDialogProps {
    prevProcedure?: RpaProcedureInterface;
    selectedTask?: Task;
    tasks?: Task[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    completeCallback?: (
        procedureQueue: ProcedureQueueItem[],
        selectedTask: Task
    ) => void;
    mutateTasks: () => Promise<void>;
}

export default function RpaProcedureDialog({
    prevProcedure,
    tasks,
    selectedTask,
    open,
    onOpenChange,
    mutateTasks,
    completeCallback,
}: RpaProcedureDialogProps) {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { slug } = router.query;

    const [currentStep, setCurrentStep] = React.useState(selectedTask ? 1 : 0);
    const [procedureData, setProcedureData] = React.useState<any>(prevProcedure || defaultProcedure);
    const [task, setTask] = React.useState<Task | null>(selectedTask || null);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);


    const taskForm = useForm<{ task: Task }>({mode: "onChange"});
    const descriptionAndStakeholdersForm = useDescriptionAndStakeholdersStepForm(procedureData)
    const purposeAndCategoriesForm = usePurposeAndCategoriesStepForm(procedureData);
    const recipeintsForm = useRecipientsStepForm(procedureData);
    const tiaForm = useTiaStepForm(procedureData);
    const securityMeasuresForm = useSecurityMeasuresStepForm(procedureData);
    const piaForm = usePiaStepForm(procedureData);

    const next = () => {
        if (currentStep === 0) {
            taskForm.handleSubmit(({task}) => {
                setTask(task);
                setCurrentStep(1);
                setProcedureData([]);
            })();
        } else if (currentStep === 1) {
            descriptionAndStakeholdersForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[0] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(2);
            })();
        } else if (currentStep === 2) {
            purposeAndCategoriesForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[1] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(3);
            })();
        } else if (currentStep === 3) {
            recipeintsForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[2] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(4);
            })();
        } else if (currentStep === 4) {
            tiaForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[3] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(5);
            })();
        } else if (currentStep === 5) {
            securityMeasuresForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[4] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(6);
            }
            )();
        } else if (currentStep === 6) {
            piaForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[5] = data;
                setProcedureData(procedureToSave);
                handleSubmit(procedureToSave, prevProcedure);
            })()
        }
    };
    const back = () => setCurrentStep(s => Math.max(s - 1, 0));

    const handleSubmit = async (procedure: any, prevProcedure?: any) => {
        try {
            setIsSaving(true);

            if (!task) {
                return;
            }
      
            const response = await axios.post<ApiResponse<Task>>(
              `/api/teams/${slug}/tasks/${task.taskNumber}/rpa`,
              {
                prevProcedure: prevProcedure || [],
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

            completeCallback?.(createProceduresQueue(procedure), task);
            mutateTasks();
            onOpenChange(false);
          } catch (error: any) {
            toast.error('Unexpected error');
          } finally {
            setIsSaving(false);
          }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{t('rpa-activities')}</DialogTitle>
                </DialogHeader>

                {currentStep === 0 && tasks && (
                    <Form {...taskForm}>
                        <form className="space-y-4">
                            <TaskPicker
                                control={taskForm.control}
                                name="task"
                                tasks={tasks.filter(
                                    (task) => !(task.properties as any)?.tia_procedure
                                )}
                            />
                        </form>
                    </Form>
                )}

                {currentStep !== 0 && (
                    <Message
                        text={`The record of processing activities allows you to make an inventory of the data processing and to have
                                    an overview of what you are
                                    doing with the concerned personal data. The recording obligation is stated by article 30 of the GDPR.
                                    It is an application to help you to be compliant with the Regulation.`}
                    />
                )}

                {currentStep === 1 && (
                    <Form {...descriptionAndStakeholdersForm}>
                        <DescriptionAndStakeholdersStep control={descriptionAndStakeholdersForm.control} />
                    </Form>
                )}

                {currentStep === 2 && (
                    <Form {...purposeAndCategoriesForm}>
                        <PurposeAndCategoriesStep control={purposeAndCategoriesForm.control} />
                    </Form>
                )}

                {currentStep === 3 && (
                    <Form {...recipeintsForm}>
                        <RecipientsStep control={recipeintsForm.control} />
                    </Form>
                )}

                {currentStep === 4 && (
                    <Form {...tiaForm}>
                        <TiaStep control={tiaForm.control} />
                    </Form>
                )}

                {currentStep === 5 && (
                    <Form {...securityMeasuresForm}>
                        <SecurityMeasuresStep control={securityMeasuresForm.control} />
                    </Form>
                )}

                {currentStep === 6 && (
                    <Form {...piaForm}>
                        <PiaStep control={piaForm.control} />
                    </Form>
                )}

                <DialogFooter className="flex justify-end space-x-2">
                    <DialogClose asChild><Button variant="outline">{t('close')}</Button></DialogClose>
                    {currentStep > 0 && <Button variant="outline" onClick={back}>{t('back')}</Button>}
                    <Button onClick={next} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin" />}
                        {currentStep < 5 ? t('next') : t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}