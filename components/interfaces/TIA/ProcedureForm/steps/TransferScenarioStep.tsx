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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/shadcn/ui/select";
import { Slider } from "@/components/shadcn/ui/slider";

import { config, fieldPropsMapping } from "@/components/defaultLanding/data/configs/tia";
import type { TransferScenarioStepValues } from "../types";
import { DatePickerInput } from "@/components/shadcn/ui/date-picker";
import { Message } from "@/components/shared";

interface TransferScenarioStepProps {
    control: Control<TransferScenarioStepValues>;
}

export default function TransferScenarioStep({ control }: TransferScenarioStepProps) {
    return (
        <>
            <Message text={`To be completed by the exporter`} />

            {/* Data Exporter */}
            <FormField
                control={control}
                name="DataExporter"
                rules={{ required: "Please specify the data exporter." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.DataExporter}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Specify the data exporter(s) or the sender"
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Country of Data Exporter */}
            <FormField
                control={control}
                name="CountryDataExporter"
                rules={{ required: "Please select a country." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.CountryDataExporter}</FormLabel>
                        <FormControl>
                            <Select
                                onValueChange={(val) => {
                                    const selected = config.countries.find((c) => c.value === val)
                                    field.onChange(selected!)
                                }}
                                value={field.value?.value}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {config.countries.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Please select from the list</FormDescription>
                    </FormItem>
                )}
            />

            {/* Data Importer */}
            <FormField
                control={control}
                name="DataImporter"
                rules={{ required: "Please specify the data importer." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.DataImporter}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Specify the data importer(s) or the receiver"
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Country of Data Importer */}
            <FormField
                control={control}
                name="CountryDataImporter"
                rules={{ required: "Please select a country." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.CountryDataImporter}</FormLabel>
                        <FormControl>
                            <Select
                                onValueChange={(val) => {
                                    const selected = config.countries.find((c) => c.value === val)
                                    field.onChange(selected!)
                                }}
                                value={field.value?.value}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {config.countries.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Please select from the list</FormDescription>
                    </FormItem>
                )}
            />

            {/* Transfer Scenario */}
            <FormField
                control={control}
                name="TransferScenario"
                rules={{ required: "Please describe the transfer scenario." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.TransferScenario}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Description of the transfer scenario"
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Data At Issue */}
            <FormField
                control={control}
                name="DataAtIssue"
                rules={{ required: "Please describe the data at issue." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.DataAtIssue}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Description of the data at issue"
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* How Data Is Transferred */}
            <FormField
                control={control}
                name="HowDataTransfer"
                rules={{ required: "Please describe how data is transferred." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.HowDataTransfer}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Description how the data is transferred (e.g., remote access only)"
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Start Date of Assessment */}
            <FormField
                control={control}
                name="StartDateAssessment"
                rules={{ required: "Please select a date." }}
                // defaultValue={initial?.StartDateAssessment?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
                render={({ field, formState }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.StartDateAssessment}</FormLabel>
                        <FormControl>
                            <DatePickerInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select date"
                                error={formState.errors.StartDateAssessment?.message}
                                isModal
                            />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Select the start date</FormDescription>
                    </FormItem>
                )}
            />

            {/* Assessment Period */}
            <FormField
                control={control}
                name="AssessmentYears"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.AssessmentYears}</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value]}
                                onValueChange={([v]) => field.onChange(v)}
                                min={1}
                                max={10}
                                step={1}
                            />
                        </FormControl>
                        <FormDescription>
                            {`${field.value} year${field.value > 1 ? 's' : ''}`}
                        </FormDescription>
                    </FormItem>
                )}
            />

            {/* Law Importer Country */}
            <FormField
                control={control}
                name="LawImporterCountry"
                rules={{ required: "Please select a country." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.LawImporterCountry}</FormLabel>
                        <FormControl>
                            <Select
                                onValueChange={(val) => {
                                    const selected = config.countries.find((c) => c.value === val)
                                    field.onChange(selected!)
                                }}
                                value={field.value?.value}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {config.countries.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                            Legal analysis on the lawful access laws of importer&apos;s
                            country
                        </FormDescription>
                    </FormItem>
                )}
            />
        </>
    );
}

