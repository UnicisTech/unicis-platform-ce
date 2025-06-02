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
import { MultiSelect } from "@/components/shadcn/ui/multi-select";
import { config, fieldPropsMapping } from "@/components/defaultLanding/data/configs/rpa";
import type { Option } from "types";
import type { PurposeAndCategoriesStepValues } from "../types";
import { Message } from "@/components/shared/atlaskit";

export interface PurposeAndCategoriesStepProps {
    control: Control<PurposeAndCategoriesStepValues>;
}

export default function PurposeAndCategoriesStep({ control }: PurposeAndCategoriesStepProps) {
    // helper to map selected string values back to full objects
    const mapOptions = (allOpts: Option[], vals: string[]): Option[] =>
        allOpts.filter((o) => vals.includes(o.value));

    return (
        <>
            <Message
                appearance="warning"
                text={
                    <span>
                        A data processing operation must have a purpose, a finality, i.e.
                        you cannot collect or process personal data simply in case it would
                        be useful to you one day. Each data processing operation must be
                        assigned a purpose, which must of course be lawful and legitimate in
                        the context of your professional activity.
                        <br />
                        <em>
                            Example: You collect a lot of information from your customers,
                            when you make a delivery, issue an invoice or offer a loyalty
                            card. All these operations on these data represent your processing
                            of personal data for the purpose of managing your customers.
                        </em>
                    </span>
                }
            />

            <FormField
                control={control}
                name="purpose"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.purpose}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Describe the principles to processing of personal data if any."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="category"
                rules={{
                    validate: (v: Option[]) =>
                        v && v.length > 0 ? undefined : "Please select a categories",
                    required: "Please select a categories",
                }}
                render={({ field, formState }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.category}</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={config.category}
                                defaultValue={field.value.map((o) => o.value)}
                                onValueChange={(vals) =>
                                    field.onChange(mapOptions(config.category, vals))
                                }
                                modalPopover={true}
                            />
                        </FormControl>
                        {!formState.errors.category ? (
                            <FormDescription>
                                Multiple selection possible for Personal Data
                            </FormDescription>
                        ) : (
                            <FormMessage>
                                {String(formState.errors.category?.message)}
                            </FormMessage>
                        )}
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="specialcategory"
                rules={{
                    validate: (v: Option[]) =>
                        v && v.length > 0 ? undefined : "Please select a categories",
                    required: "Please select a categories",
                }}
                render={({ field, formState }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.specialcategory}</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={config.specialcategory}
                                defaultValue={field.value.map((o) => o.value)}
                                onValueChange={(vals) =>
                                    field.onChange(mapOptions(config.specialcategory, vals))
                                }
                                modalPopover={true}
                            />
                        </FormControl>
                        {!formState.errors.specialcategory ? (
                            <FormDescription>
                                Multiple selection possible
                            </FormDescription>
                        ) : (
                            <FormMessage>
                                {String(formState.errors.specialcategory?.message)}
                            </FormMessage>
                        )}
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="datasubject"
                rules={{
                    validate: (v: Option[]) =>
                        v && v.length > 0 ? undefined : "Please select a categories",
                    required: "Please select a categories",
                }}
                render={({ field, formState }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.datasubject}</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={config.datasubject}
                                defaultValue={field.value.map((o) => o.value)}
                                onValueChange={(vals) =>
                                    field.onChange(mapOptions(config.datasubject, vals))
                                }
                                modalPopover={true}
                            />
                        </FormControl>
                        {!formState.errors.datasubject ? (
                            <FormDescription>
                                Multiple selection possible, and if others please specify on the ticket
                            </FormDescription>
                        ) : (
                            <FormMessage>
                                {String(formState.errors.datasubject?.message)}
                            </FormMessage>
                        )}
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="retentionperiod"
                rules={{ required: "Please select a period" }}
                render={({ field, formState }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.retentionperiod}</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={config.retentionperiod}
                                defaultValue={field.value?.value ? [field.value?.value] : undefined}
                                onValueChange={(vals) => {
                                    const sel = config.retentionperiod.find((c) => c.value === vals[0])!;
                                    field.onChange(sel);
                                }}
                                modalPopover={true}
                            />
                        </FormControl>
                        {!formState.errors.retentionperiod ? (
                            <FormDescription>
                                Please specify the data retention period
                            </FormDescription>
                        ) : (
                            <FormMessage>
                                {String(formState.errors.retentionperiod?.message)}
                            </FormMessage>
                        )}
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="commentsretention"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.commentsretention}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="In some cases (payroll management), it is necessary to retain certain data for a longer period of time, depending on your legal obligations or if the data are of administrative interest (litigation)."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}