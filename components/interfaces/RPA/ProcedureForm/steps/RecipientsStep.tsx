import * as React from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/shadcn/ui/form';
import { Textarea } from '@/components/shadcn/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import type { RecipientsStepValues } from '../types';
import { Message } from '@/components/shared';

export interface RecipientsStepProps {
  control: Control<RecipientsStepValues>;
}

export default function RecipientsStep({ control }: RecipientsStepProps) {
  return (
    <>
      <Message
        appearance="warning"
        text={
          <span>
            List all persons who have access to the data;
            <br />
            For example: recruitment department, IT department, management,
            service providers, partners, hosts, etc.
          </span>
        }
      />

      <FormField
        control={control}
        name="recipientType"
        rules={{ required: 'Please select a type.' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.recipientType}</FormLabel>
            <FormControl>
              <Select
                value={field.value.value}
                onValueChange={(val) => {
                  const sel = config.recipientType.find(
                    (o) => o.value === val
                  )!;
                  field.onChange(sel);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  {config.recipientType.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <FormDescription>
              Please specify the type of recipient if not on a list specify on
              details
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="recipientdetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.recipientdetails}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Write details if you select others or there is no recipeint type above."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
