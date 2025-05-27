"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/shadcn/ui/form";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Slider } from "@/components/shadcn/ui/slider";
import type { RiskTreatmentStepValues } from "../types";

export interface RiskTreatmentStepProps {
    control: Control<RiskTreatmentStepValues>;
}

export default function RiskTreatmentStep({ control }: RiskTreatmentStepProps) {
    return (
        <>
            <FormField
                control={control}
                name="RiskTreatment"
                rules={{ required: "Describe how the risk is to be treated." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Risk Treatment</FormLabel>
                        <FormDescription>
                            Describe how the risk is to be treated (e.g., controlled, avoided, transferred, or accepted).
                        </FormDescription>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Describe treatment approach"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="TreatmentCost"
                rules={{ required: "Estimate the total cost of mitigating the risk." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Treatment Cost</FormLabel>
                        <FormDescription>
                            Estimate the total cost of mitigating the risk.
                        </FormDescription>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Enter cost estimate"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="TreatmentStatus"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Treatment Status (%)</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value]}
                                onValueChange={([v]) => field.onChange(v)}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </FormControl>
                        <FormDescription>
                            To what extent is the planned treatment in place? 0% means only
                            a plan exists; 100% means the treatment is fully operational.
                        </FormDescription>
                        <FormDescription>{`${field.value} percent (max. 100)`}</FormDescription>
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="TreatedProbability"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Treated Probability (%)</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value]}
                                onValueChange={([v]) => field.onChange(v)}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </FormControl>
                        <FormDescription>
                            Enter the probability that the risk will occur after mitigation.
                        </FormDescription>
                        <FormDescription>{`${field.value} percent (max. 100)`}</FormDescription>
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="TreatedImpact"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Treated Impact (%)</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value]}
                                onValueChange={([v]) => field.onChange(v)}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </FormControl>
                        <FormDescription>
                            Enter the likely impact after mitigation. Incidents due to
                            control failures may have higher impacts. Bold treated values if
                            they differ from raw values.
                        </FormDescription>
                        <FormDescription>{`${field.value} percent (max. 100)`}</FormDescription>
                    </FormItem>
                )}
            />
        </>
    );
}
