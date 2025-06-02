import * as React from "react";
import { useRouter } from "next/router";
import { Control } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/shadcn/ui/form";
import { Input } from "@/components/shadcn/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/shadcn/ui/select";
import { DatePickerInput } from "@/components/shadcn/ui/date-picker";
import useTeamMembers from "hooks/useTeamMembers";
import { Loading, Error } from "@/components/shared";
import type { DescriptionAndStakeholdersStepValues } from "../types";
import type { Option } from "types";
import { Message } from "@/components/shared";

export interface DescriptionAndStakeholdersStepProps {
    control: Control<DescriptionAndStakeholdersStepValues>;
}

export default function DescriptionAndStakeholdersStep({ control }: DescriptionAndStakeholdersStepProps) {
    const router = useRouter();
    const { slug } = router.query;
    const { isLoading, isError, members } = useTeamMembers(slug as string);

    if (isLoading) {
        return <Loading />;
    }
    if (isError || !members) {
        return <Error message={isError?.message} />;
    }

    const dpoOptions: Option[] = members.map(({ user }) => ({ value: user.id, label: user.name }));

    return (
        <>
            <Message
                appearance="warning"
                text={`A personal data processing is an operation, or set of operations, involving personal data,
                        whatever
                        the method used (collection, recording, organisation, storage, adaptation, modification, extraction,
                        consultation, use, communication by diffusion, transmission or any other form of making available,
                        linkage).`}
            />

            <FormField
                control={control}
                name="reviewDate"
                rules={{ required: "Please select a due date." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Review Date</FormLabel>
                        <FormControl>
                            <DatePickerInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select date"
                                isModal
                            />
                        </FormControl>
                        <FormDescription>
                            Specify a future date for reviewing the record
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="controller"
                rules={{ required: "Please enter the controller." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Controller</FormLabel>
                        <FormControl>
                            <Input {...field} autoComplete="off" placeholder="Enter controller name" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="dpo"
                rules={{ required: "Please select a DPO." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Data Protection Officer</FormLabel>
                        <FormControl>
                            <Select
                                value={field.value?.value}
                                onValueChange={(val) => {
                                    const sel = dpoOptions.find((o) => o.value === val)!;
                                    field.onChange(sel);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a DPO" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dpoOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
