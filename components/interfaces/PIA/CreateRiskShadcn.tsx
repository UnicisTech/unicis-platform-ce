"use client";

import * as React from "react";
import { useForm, Control } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/shadcn/ui/form";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/shadcn/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";
import { Textarea } from "@/components/shadcn/ui/textarea";
import TaskPicker from "@/components/shared/shadcn/TaskPicker";
import { fieldPropsMapping, config, riskSecurityPoints, riskProbabilityPoints } from "@/components/defaultLanding/data/configs/pia";
import RiskMatrixBubbleChart from './RiskMatrixBubbleChart';
import type { Task } from "@prisma/client";
import type { PiaRisk, TaskProperties } from "types";

const shouldShowExtraStage = (risk: PiaRisk | []): boolean => {
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

type FirstStageValues = {
  isDataProcessingNecessary: string;
  isDataProcessingNecessaryAssessment: string;
  isProportionalToPurpose: string;
  isProportionalToPurposeAssessment: string;
};

type SecondStageValues = {
  confidentialityRiskProbability: string;
  confidentialityRiskSecurity: string;
  confidentialityAssessment: string;
};

type ThirdStageValues = {
  availabilityRiskProbability: string;
  availabilityRiskSecurity: string;
  availabilityAssessment: string;
};

type FourthStageValues = {
  transparencyRiskProbability: string;
  transparencyRiskSecurity: string;
  transparencyAssessment: string;
};

type ExtraStageValues = {
  guarantees: string;
  securityMeasures: string;
  securityCompliance: string;
  dealingWithResidualRisk: string;
  dealingWithResidualRiskAssessment: string;
  supervisoryAuthorityInvolvement: string;
};

const useFirstStgeForm = (risk: PiaRisk) => {
  return useForm<FirstStageValues>({
    defaultValues: {
      isDataProcessingNecessary:
        risk[0]?.isDataProcessingNecessary ?? "",
      isDataProcessingNecessaryAssessment:
        risk[0]?.isDataProcessingNecessaryAssessment ?? "",
      isProportionalToPurpose:
        risk[0]?.isProportionalToPurpose ?? "",
      isProportionalToPurposeAssessment:
        risk[0]?.isProportionalToPurposeAssessment ?? "",
    },
    mode: "onChange",
  })
}

const useSecondStageForm = (risk: PiaRisk) => {
  return useForm<SecondStageValues>({
    defaultValues: {
      confidentialityRiskProbability:
        risk[1]?.confidentialityRiskProbability ?? "",
      confidentialityRiskSecurity:
        risk[1]?.confidentialityRiskSecurity ?? "",
      confidentialityAssessment:
        risk[1]?.confidentialityAssessment ?? "",
    },
    mode: "onChange",
  });
}

const useThirdStageForm = (risk: PiaRisk) => {
  return useForm<ThirdStageValues>({
    defaultValues: {
      availabilityRiskProbability:
        risk[2]?.availabilityRiskProbability ?? "",
      availabilityRiskSecurity:
        risk[2]?.availabilityRiskSecurity ?? "",
      availabilityAssessment:
        risk[2]?.availabilityAssessment ?? "",
    },
    mode: "onChange",
  });
}

const useFourthStageForm = (risk: PiaRisk) => {
  return useForm<FourthStageValues>({
    defaultValues: {
      transparencyRiskProbability:
        risk[3]?.transparencyRiskProbability ?? "",
      transparencyRiskSecurity:
        risk[3]?.transparencyRiskSecurity ?? "",
      transparencyAssessment:
        risk[3]?.transparencyAssessment ?? "",
    },
    mode: "onChange",
  });
}

const useExtraStageForm = (risk: PiaRisk) => {
  return useForm<ExtraStageValues>({
    defaultValues: {
      guarantees: risk[4]?.guarantees ?? "",
      securityMeasures: risk[4]?.securityMeasures ?? "",
      securityCompliance: risk[4]?.securityCompliance ?? "",
      dealingWithResidualRisk: risk[4]?.dealingWithResidualRisk ?? "",
      dealingWithResidualRiskAssessment: risk[4]?.dealingWithResidualRiskAssessment ?? "",
      supervisoryAuthorityInvolvement: risk[4]?.supervisoryAuthorityInvolvement ?? "",
    },
    mode: "onChange",
  });
}

interface MultiStepDialogFormProps {
  prevRisk?: any;
  selectedTaskId?: string;
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MultiStepDialogForm({
  prevRisk,
  selectedTaskId,
  tasks,
  open,
  onOpenChange,
}: MultiStepDialogFormProps) {
  const [step, setStep] = React.useState(prevRisk ? 1 : 0);
  const [risk, setRisk] = React.useState<any>(prevRisk || []);
  const [taskId, setTaskId] = React.useState<string | null>(selectedTaskId || null);

  console.log('risk but shadcn', risk)

  const taskStage = useForm<{ taskId: string }>({ defaultValues: { taskId: "" }, mode: "onChange" });
  const firstStage = useFirstStgeForm(risk);
  const secondStage = useSecondStageForm(risk)
  const thirdStage = useThirdStageForm(risk);
  const fourthStage = useFourthStageForm(risk);
  const extraStage = useExtraStageForm(risk);

  const showExtraStage = shouldShowExtraStage(risk);

  // Reset forms and state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setRisk([]);
      taskStage.reset();
      firstStage.reset();
      secondStage.reset();
      thirdStage.reset();
      fourthStage.reset();
      extraStage.reset();
    }
  }, [open, taskStage, firstStage, secondStage, thirdStage, fourthStage, extraStage]);

  const next = () => {
    if (step === 0) {
      taskStage.handleSubmit((data) => {
        console.log('step 0 data task?', data)
        setTaskId(data.taskId);
        // setRisk([data]);
        setStep(1);
      })();
    } else if (step === 1) {
      firstStage.handleSubmit((data) => {
        setRisk((prev) => [...prev, data]);
        setStep(2);
      })();
    } else if (step === 2) {
      secondStage.handleSubmit((data) => {
        setRisk((prev) => [...prev, data]);
        setStep(3);
      })();
    } else if (step === 3) {
      thirdStage.handleSubmit((data) => {
        setRisk((prev) => [...prev, data]);
        setStep(4);
      })();
    } else if (step === 4) {
      fourthStage.handleSubmit((data) => {
        setRisk((prev) => [...prev, data]);
        setStep(5);
      }
      )();
    } else if (step === 5) {
      if (showExtraStage) {
        setStep(6);
      } else {
        submit(risk);
      }
    } else if (step === 6) {
      extraStage.handleSubmit((data) => {
        const riskToSave = [...risk, data];
        setRisk(riskToSave);
        submit(riskToSave);
      })();
    }
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 1));

  const submit = (data: any) => {
    console.log('submit data', data);
  };

  console.log('step', step)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden p-6"
      >
        <DialogHeader>
          <DialogTitle>Privacy Impact Assessment</DialogTitle>
        </DialogHeader>

        {step === 0 && (
          <Form {...taskStage}>
            <form className="space-y-4">
              <TaskPicker control={taskStage.control} name="taskId" tasks={tasks} />
            </form>
          </Form>
        )}
        {step === 1 && (
          <Form {...firstStage}>
            <form className="space-y-4">
              <FirstStage risk={risk} control={firstStage.control} />
            </form>
          </Form>
        )}
        {step === 2 && (
          <Form {...secondStage}>
            <form className="space-y-4">
              <SecondStage risk={risk} control={secondStage.control} />
            </form>
          </Form>
        )}
        {step === 3 && (
          <Form {...thirdStage}>
            <form className="space-y-4">
              <ThirdStage risk={risk} control={thirdStage.control} />
            </form>
          </Form>
        )}
        {step === 4 && (
          <Form {...fourthStage}>
            <form className="space-y-4">
              <FourthStage risk={risk} control={fourthStage.control} />
            </form>
          </Form>
        )}
        {step === 5 && (
          <div className="space-y-4">
            <p>Results</p>
            <Results risk={risk} />
          </div>
        )}
        {step === 6 && showExtraStage && (
          <Form {...extraStage}>
            <form className="space-y-4">
              <ExtraStage risk={risk} control={extraStage.control} />
            </form>
          </Form>
        )}

        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {step > 1 && (
            <Button variant="outline" onClick={back}>
              Back
            </Button>
          )}
          {step < (showExtraStage ? 6 : 5) ? (
            <Button onClick={next}>
              Next
            </Button>
          ) : (
            <Button onClick={next}>Create</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const FirstStage = ({ risk, control }: {
  risk: PiaRisk | [];
  control: Control<any>;
}) => {
  // Pre-fill values from risk[0] if available
  const initial = risk[0];
  console.log('FirstStage initial risk', initial)

  return (
    <>
      <p>Is the data processing necessary, and is it proportional to the purpose?</p>

      <FormField
        control={control}
        name="isDataProcessingNecessary"
        rules={{ required: "Please select an option." }}
        defaultValue={initial?.isDataProcessingNecessary ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.isDataProcessingNecessary}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.isDataProcessingNecessary.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isDataProcessingNecessaryAssessment"
        defaultValue={initial?.isDataProcessingNecessaryAssessment ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.isDataProcessingNecessaryAssessment}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isProportionalToPurpose"
        rules={{ required: "Please select an option." }}
        defaultValue={initial?.isProportionalToPurpose ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.isProportionalToPurpose}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.isProportionalToPurpose.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isProportionalToPurposeAssessment"
        defaultValue={initial?.isProportionalToPurposeAssessment ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.isProportionalToPurposeAssessment}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

const SecondStage = ({ risk, control }: {
  risk: PiaRisk;
  control: Control<SecondStageValues>;
}) => {
  const initial = risk[1] || {};

  return (
    <>
      <p>
        What are the risks to the privacy and rights of the people whose data is
        being processed?
      </p>
      <p>1. Confidentiality and Integrity</p>

      <FormField
        control={control}
        name="confidentialityRiskProbability"
        rules={{ required: "Please select an option." }}
        defaultValue={initial.confidentialityRiskProbability ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {fieldPropsMapping.confidentialityRiskProbability}
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
              >
                {config.confidentialityRiskProbability.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="confidentialityRiskSecurity"
        rules={{ required: "Please select an option." }}
        defaultValue={initial.confidentialityRiskSecurity ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {fieldPropsMapping.confidentialityRiskSecurity}
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
              >
                {config.confidentialityRiskSecurity.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="confidentialityAssessment"
        defaultValue={initial.confidentialityAssessment ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {fieldPropsMapping.confidentialityAssessment}
            </FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function ThirdStage({ risk, control }: {
  risk: PiaRisk;
  control: Control<ThirdStageValues>;
}) {
  const initial = risk[2] || {};

  return (
    <>
      <p>
        What are the risks to the privacy and rights of the people whose data is
        being processed?
      </p>
      <p>2. Availability</p>

      {/* Probability of availability risk */}
      <FormField
        control={control}
        name="availabilityRiskProbability"
        rules={{ required: "Please select an option." }}
        defaultValue={initial.availabilityRiskProbability ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.availabilityRiskProbability}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.availabilityRiskProbability.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Security of availability risk */}
      <FormField
        control={control}
        name="availabilityRiskSecurity"
        rules={{ required: "Please select an option." }}
        defaultValue={initial.availabilityRiskSecurity ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.availabilityRiskSecurity}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.availabilityRiskSecurity.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Assessment textarea */}
      <FormField
        control={control}
        name="availabilityAssessment"
        defaultValue={initial.availabilityAssessment ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.availabilityAssessment}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function FourthStage({ risk, control }: {
  risk: PiaRisk;
  control: Control<FourthStageValues>;
}) {
  const initial = risk[3] || {};

  return (
    <>
      <p>
        What are the risks to the privacy and rights of the people whose data is
        being processed?
      </p>
      <p>3. Transparency, anonymization and data minimization</p>

      {/* Probability */}
      <FormField
        control={control}
        name="transparencyRiskProbability"
        rules={{ required: "Please select an option." }}
        defaultValue={initial.transparencyRiskProbability ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.transparencyRiskProbability}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.transparencyRiskProbability.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Security */}
      <FormField
        control={control}
        name="transparencyRiskSecurity"
        rules={{ required: "Please select an option." }}
        defaultValue={initial.transparencyRiskSecurity ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.transparencyRiskSecurity}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.transparencyRiskSecurity.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Assessment textarea */}
      <FormField
        control={control}
        name="transparencyAssessment"
        defaultValue={initial.transparencyAssessment ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.transparencyAssessment}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

const Results = ({ risk }: { risk: PiaRisk }) => {
  console.log('Results risk', risk)
  return (
    <>
      <p>a) Confidentiality and Integrity</p>
      <RiskMatrixBubbleChart
        datasets={[
          {
            label: 'Confidentiality and Integrity Risk',
            borderWidth: 1,
            data: [
              {
                x: riskSecurityPoints[risk[1].confidentialityRiskSecurity],
                y: riskProbabilityPoints[
                  risk[1].confidentialityRiskProbability
                ],
                r: 15,
              },
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        ]}
      />
      <p>b) Availability</p>
      <RiskMatrixBubbleChart
        datasets={[
          {
            label: 'Availability',
            borderWidth: 1,
            data: [
              {
                x: riskSecurityPoints[risk[2].availabilityRiskSecurity],
                y: riskProbabilityPoints[risk[2].availabilityRiskProbability],
                r: 15,
              },
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        ]}
      />
      <p>c) Transparency, purpose limitation and data minimization</p>
      <RiskMatrixBubbleChart
        datasets={[
          {
            label: 'Transparency, purpose limitation and data minimization',
            borderWidth: 1,
            data: [
              {
                x: riskSecurityPoints[risk[3].transparencyRiskSecurity],
                y: riskProbabilityPoints[risk[3].transparencyRiskProbability],
                r: 15,
              },
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        ]}
      />
    </>
  );
};

const ExtraStage = ({ risk, control }: {
  risk: PiaRisk;
  control: Control<ExtraStageValues>;
}) => {
  const initial = risk[4];

  return (
    <>
      <p>Corrective measures</p>

      {/* Guarantees textarea */}
      <FormField
        control={control}
        name="guarantees"
        defaultValue={initial?.guarantees ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.guarantees}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Security Measures textarea */}
      <FormField
        control={control}
        name="securityMeasures"
        defaultValue={initial?.securityMeasures ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.securityMeasures}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Security Compliance textarea */}
      <FormField
        control={control}
        name="securityCompliance"
        defaultValue={initial?.securityCompliance ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.securityCompliance}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dealing With Residual Risk */}
      <FormField
        control={control}
        name="dealingWithResidualRisk"
        rules={{ required: "Please select an option." }}
        defaultValue={initial?.dealingWithResidualRisk ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.dealingWithResidualRisk}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.dealingWithResidualRisk.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Residual Risk Assessment */}
      <FormField
        control={control}
        name="dealingWithResidualRiskAssessment"
        defaultValue={initial?.dealingWithResidualRiskAssessment ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.dealingWithResidualRiskAssessment}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Supervisory Authority Involvement */}
      <FormField
        control={control}
        name="supervisoryAuthorityInvolvement"
        rules={{ required: "Please select an option." }}
        defaultValue={initial?.supervisoryAuthorityInvolvement ?? ""}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.supervisoryAuthorityInvolvement}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.supervisoryAuthorityInvolvement.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}



