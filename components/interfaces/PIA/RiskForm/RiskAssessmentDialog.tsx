"use client";

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
import TaskPicker from "@/components/shared/shadcn/TaskPicker";
import { Loader2 } from "lucide-react"

import { useDataProcessingStepForm, useConfidentialityStepForm, useAvailabilityStepForm, useTransparencyStepForm, useCorrectiveMeasuresStepForm } from "./hooks";
import { DataProcessingStep, ConfidentialityStep, AvailabilityStep, TransparencyStep, ResultsStep, CorrectiveMeasuresStep } from "./steps";
import { riskProbabilityPoints, riskSecurityPoints } from "@/components/defaultLanding/data/configs/pia";
import type { ApiResponse, PiaRisk } from "types";
import type { Task } from "@prisma/client";

interface RiskAssessmentDialogProps {
    prevRisk?: PiaRisk;
    selectedTaskId?: string;
    tasks?: Task[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    completeCallback?: () => void;
    mutateTasks: () => Promise<void>;
}

const shouldShowExtraStep = (risk: PiaRisk | []): boolean => {
    if (!risk[1] || !risk[2] || !risk[3]) return false;

    const confidentialityRisk =
        riskProbabilityPoints[risk[1].confidentialityRiskProbability] *
        riskSecurityPoints[risk[1].confidentialityRiskSecurity];
    const availabilityRisk =
        riskProbabilityPoints[risk[2].availabilityRiskProbability] *
        riskSecurityPoints[risk[2].availabilityRiskSecurity];
    const transparencyRisk =
        riskProbabilityPoints[risk[3].transparencyRiskProbability] *
        riskSecurityPoints[risk[3].transparencyRiskSecurity];

    return [confidentialityRisk, availabilityRisk, transparencyRisk].some(
        (r) => r > 10
    );
};

export default function RiskAssessmentDialog({
    prevRisk,
    selectedTaskId,
    tasks,
    open,
    onOpenChange,
    completeCallback,
    mutateTasks,
}: RiskAssessmentDialogProps) {
    const { t } = useTranslation('common');

    const router = useRouter();
    const { slug } = router.query;

    const [currentStep, setCurrentStep] = React.useState(selectedTaskId ? 1 : 0);
    const [riskData, setRiskData] = React.useState<any>(prevRisk || []);
    const [taskId, setTaskId] = React.useState<string | null>(selectedTaskId || null);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    console.log('RiskAssessmentDialog - currentStep:', { currentStep, riskData, prevRisk, selectedTaskId });
    // Forms for each step
    const taskForm = useForm<{ taskId: string }>({ defaultValues: { taskId: selectedTaskId ?? "" }, mode: "onChange" });
    const dataTransparancyForm = useDataProcessingStepForm(riskData);
    const confidentialityForm = useConfidentialityStepForm(riskData);
    const availabilityForm = useAvailabilityStepForm(riskData);
    const transparencyForm = useTransparencyStepForm(riskData);
    const correctiveForm = useCorrectiveMeasuresStepForm(riskData);

    const extraRequired = shouldShowExtraStep(riskData);

    // Reset on dialog close
    React.useEffect(() => {
        if (!open) {
            setCurrentStep(prevRisk ? 1 : 0);
            setRiskData(prevRisk ?? []);
            taskForm.reset({ taskId: selectedTaskId ?? "" });
            dataTransparancyForm.reset();
            confidentialityForm.reset();
            availabilityForm.reset();
            transparencyForm.reset();
            correctiveForm.reset();
        }
    }, [open, prevRisk, selectedTaskId]);

    // Navigation handlers
    const next = () => {
        if (currentStep === 0) {
            taskForm.handleSubmit(({ taskId }) => {
                setTaskId(taskId);
                setCurrentStep(1);
                setRiskData([]);
            })();
        } else if (currentStep === 1) {
            dataTransparancyForm.handleSubmit((data) => {
                const riskToSave = [...riskData]
                riskToSave[0] = data;
                setRiskData(riskToSave);
                setCurrentStep(2);
            })();
        } else if (currentStep === 2) {
            confidentialityForm.handleSubmit((data) => {
                const riskToSave = [...riskData]
                riskToSave[1] = data;
                setRiskData(riskToSave);
                setCurrentStep(3);
            })();
        } else if (currentStep === 3) {
            availabilityForm.handleSubmit((data) => {
                const riskToSave = [...riskData]
                riskToSave[2] = data;
                setRiskData(riskToSave);
                setCurrentStep(4);
            })();
        } else if (currentStep === 4) {
            transparencyForm.handleSubmit((data) => {
                const riskToSave = [...riskData]
                riskToSave[3] = data;
                setRiskData(riskToSave);
                setCurrentStep(5);
            })();
        } else if (currentStep === 5) {
            if (extraRequired) {
                setCurrentStep(6);
            } else {
                handleSubmit(riskData);
            }
        } else if (currentStep === 6) {
            correctiveForm.handleSubmit((data) => {
                const riskToSave = [...riskData];
                riskToSave[4] = data;
                setRiskData(riskToSave);
                handleSubmit(riskToSave, prevRisk);
            })();
        }
    };

    const back = () => setCurrentStep(s => Math.max(s - 1, 0));

    const handleSubmit = async (risk: any, prevRisk?: any) => {
        try {
            setIsSaving(true);
            if (!taskId) {
                return;
            }

            const response = await axios.post<ApiResponse<Task>>(
                `/api/teams/${slug}/tasks/${taskId}/pia`,
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
                toast.success(t('pia-created'));
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
                    <DialogTitle>{t('pia')}</DialogTitle>
                </DialogHeader>

                {currentStep === 0 && tasks && (
                    <Form {...taskForm}>
                        <form className="space-y-4">
                            <TaskPicker
                                control={taskForm.control}
                                name="taskId"
                                tasks={tasks.filter(
                                    (task) => !(task.properties as any)?.pia_risk
                                )}
                            />
                        </form>
                    </Form>
                )}

                {currentStep === 1 && (
                    <Form {...dataTransparancyForm}>
                        <DataProcessingStep initial={riskData[0]} control={dataTransparancyForm.control} />
                    </Form>
                )}
                {currentStep === 2 && (
                    <Form {...confidentialityForm}>
                        <ConfidentialityStep initial={riskData[1]} control={confidentialityForm.control} />
                    </Form>
                )}
                {currentStep === 3 && (
                    <Form {...availabilityForm}>
                        <AvailabilityStep initial={riskData[2]} control={availabilityForm.control} />
                    </Form>
                )}
                {currentStep === 4 && (
                    <Form {...transparencyForm}>
                        <TransparencyStep initial={riskData[3]} control={transparencyForm.control} />
                    </Form>
                )}
                {currentStep === 5 && <ResultsStep risk={riskData} />}
                {currentStep === 6 && (
                    <Form {...correctiveForm}>
                        <CorrectiveMeasuresStep initial={riskData[4]} control={correctiveForm.control} />
                    </Form>
                )}

                <DialogFooter className="flex justify-end space-x-2">
                    <DialogClose asChild><Button variant="outline">{t('close')}</Button></DialogClose>
                    {currentStep > 0 && <Button variant="outline" onClick={back}>{t('back')}</Button>}
                    <Button onClick={next} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin" />}
                        {currentStep < (extraRequired ? 6 : 5) ? t('next') : t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
