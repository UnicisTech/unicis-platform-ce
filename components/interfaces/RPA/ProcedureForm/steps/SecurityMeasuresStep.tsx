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
import { MultiSelect } from "@/components/shadcn/ui/multi-select";
import { config, fieldPropsMapping } from "@/components/defaultLanding/data/configs/rpa";
import type { Option } from "types";
import type { SecurityMeasuresStepValues } from "../types";
import { Message } from "@/components/shared/atlaskit";

export interface SecurityMeasuresStepProps {
  control: Control<SecurityMeasuresStepValues>;
}

export function SecurityMeasuresStep({ control }: SecurityMeasuresStepProps) {
    const mapOptions = (opts: Option[], vals: string[]): Option[] =>
      opts.filter((o) => vals.includes(o.value));
  
    return (
      <>
        <Message
          appearance="warning"
          text={
            <span>
              Secure your data:
              <br />
              - Ensure the integrity of your data assets by minimizing the risk of
              data loss or hacking.
              <br />
              - The measures to be taken, whether electronic or physical, depend
              on the sensitiveness of the data you are processing and the risks to
              data subjects in the event of an incident.
              <br />
              - Various actions must be implemented: updating your antivirus and
              software, regularly changing passwords and adopting complex
              passwords, or encrypting your data in certain situations. In the
              event of loss or theft of an electronic device, it will be more
              difficult for a third party to access it.
            </span>
          }
        />
  
        <FormField
          control={control}
          name="toms"
          rules={{ 
            validate: (v: Option[]) => v && v.length > 0 ? undefined : "Please select at least one" ,
            required: "Please select at least one"
        }}
          render={({ field, formState }) => (
            <FormItem>
              <FormLabel>{fieldPropsMapping.toms}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={config.toms}
                  defaultValue={field.value.map((o) => o.value)}
                  onValueChange={(vals) => field.onChange(mapOptions(config.toms, vals))}
                  modalPopover={true}
                />
              </FormControl>
              {!formState.errors.toms ? (
                <FormDescription>
                  Multiple selection possible, and if others please specify on the ticket
                </FormDescription>
              ) : (
                <FormMessage>
                  {String(formState.errors.toms?.message)}
                </FormMessage>
              )}
            </FormItem>
          )}
        />
  
        <Message
          appearance="warning"
          text="Please attach the relevant security certification and documents to the task."
        />
      </>
    );
  }