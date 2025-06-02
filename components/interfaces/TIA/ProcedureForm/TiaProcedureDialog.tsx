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
import { ApiResponse, defaultProcedure, TiaProcedureInterface } from "types";
import { TransferScenarioStep, ProblematicLawfulAccessStep, RiskStep, ProbabilityStep, ConclusionStep } from "./steps";
import { useTransferScenarioStepForm, useProblematicLawfulAccessStepForm, useRiskStepForm, useProbabilityStepForm } from "./hooks";
import TaskPicker from "@/components/shared/shadcn/TaskPicker";
import { shouldSkipTwoSteps } from "@/lib/tia";
import { Message } from "@/components/shared";

interface TiaProcedureDialogProps {
    prevProcudere?: TiaProcedureInterface;
    selectedTask?: Task;
    tasks?: Task[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    completeCallback?: () => void;
    mutateTasks: () => Promise<void>;
}

export default function TiaProcedureDialog({
    prevProcudere,
    tasks,
    selectedTask,
    open,
    onOpenChange,
    mutateTasks,
    completeCallback,
}: TiaProcedureDialogProps) {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { slug } = router.query;

    const [currentStep, setCurrentStep] = React.useState(selectedTask ? 1 : 0);
    const [procedureData, setProcedureData] = React.useState<any>(prevProcudere || defaultProcedure);
    const [task, setTask] = React.useState<Task | null>(selectedTask || null);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    const taskForm = useForm<{ task: Task }>({ mode: "onChange" });
    const transferScenarioForm = useTransferScenarioStepForm(procedureData);
    const problematicLawfulAccessForm = useProblematicLawfulAccessStepForm(procedureData);
    const riskForm = useRiskStepForm(procedureData)
    const probabilityForm = useProbabilityStepForm(procedureData);

    const next = () => {
        if (currentStep === 0) {
            taskForm.handleSubmit(({ task }) => {
                setTask(task);
                setCurrentStep(1);
                setProcedureData([]);
            })();
        } else if (currentStep === 1) {
            transferScenarioForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[0] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(2);
            })();
        } else if (currentStep === 2) {
            problematicLawfulAccessForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[1] = data;
                setProcedureData(procedureToSave);
                if (shouldSkipTwoSteps(data)) {
                    setCurrentStep(5);
                } else {
                    setCurrentStep(3);
                }
            })();
        } else if (currentStep === 3) {
            riskForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[2] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(4);
            })();
        } else if (currentStep === 4) {
            probabilityForm.handleSubmit((data) => {
                const procedureToSave = [...procedureData]
                procedureToSave[3] = data;
                setProcedureData(procedureToSave);
                setCurrentStep(5);
            })();
        } else if (currentStep === 5) {
            handleSubmit(procedureData);
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
                `/api/teams/${slug}/tasks/${task.taskNumber}/tia`,
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
                toast.success(t('tia-created'));
            }

            completeCallback?.();
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
                    <DialogTitle>{t('tia')}</DialogTitle>
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
                        text={`Add a Transfer Impact Assessment if you are using the EU Standard Contractual Clauses (EU SCC) or under the other GDPR (or CH DPA) legal situations.
											Transfer Impact Assessment (TIA) for use under the EU General Data Protection Regulation (GDPR) and Swiss Data Protection Act (CH DPA), including for complying with the EU Standard Contractual Clauses (EU SCC).`}
                    />
                )}

                {currentStep === 1 && (
                    <Form {...transferScenarioForm}>
                        <TransferScenarioStep control={transferScenarioForm.control} />
                    </Form>
                )}

                {currentStep === 2 && (
                    <Form {...problematicLawfulAccessForm}>
                        <ProblematicLawfulAccessStep control={problematicLawfulAccessForm.control} />
                    </Form>
                )}

                {currentStep === 3 && (
                    <Form {...riskForm}>
                        <RiskStep
                            control={riskForm.control}
                            problematicLawfulAccessValues={procedureData[1]}
                        />
                    </Form>
                )}

                {currentStep === 4 && (
                    <Form {...probabilityForm}>
                        <ProbabilityStep
                            control={probabilityForm.control}
                            problematicLawfulAccessValues={procedureData[1]}
                            riskValues={procedureData[2]}
                        />
                    </Form>
                )}

                {currentStep === 5 && (
                    <ConclusionStep
                        procedure={procedureData}
                    />
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