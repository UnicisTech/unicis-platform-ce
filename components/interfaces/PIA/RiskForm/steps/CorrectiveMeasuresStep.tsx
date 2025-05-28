"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/shadcn/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { fieldPropsMapping, config } from "@/components/defaultLanding/data/configs/pia";
import type { PiaRisk } from "types";
import { CorrectiveMeasuresStepValues } from "../types";

const CorrectiveMeasuresStep = ({ initial, control }: {
    initial?: PiaRisk[4];
    control: Control<CorrectiveMeasuresStepValues>;
}) => (
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

export default CorrectiveMeasuresStep;
