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
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import type { Option } from 'types';
import type { TransferStepValues } from '../types';
import { Message } from '@/components/shared';

export interface TransferStepProps {
  control: Control<TransferStepValues>;
}

export default function TransferStep({ control }: TransferStepProps) {
  // helper to map strings back to objects
  const mapOptions = (opts: Option[], vals: string[]): Option[] =>
    opts.filter((o) => vals.includes(o.value));

  return (
    <>
      <Message
        appearance="warning"
        text={
          <span>
            When you transfer data outside the European Union: <br />
            - Check whether the country outside the EU to which you are
            transferring the data has data protection legislation and whether it
            is recognised as adequate by the European Commission. <br />- A map
            of the world presenting data protection legislation. <br />-
            Otherwise, you will have to provide a legal framework your transfers
            to ensure data protection abroad.
          </span>
        }
      />

      <FormField
        control={control}
        name="datatransfer"
        render={({ field }) => (
          <FormItem className="flex items-end space-x-2">
            <FormControl>
              <Checkbox
                id="datatransfer"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel htmlFor="datatransfer">
              {fieldPropsMapping.datatransfer}
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="recipient"
        rules={{ required: 'Please enter a recipient.' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.recipient}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
            <FormDescription>
              Recipient is a natural or legal person, public authority, agency
              or another body which the personal data are disclosed.
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="country"
        rules={{ required: 'Please select a country.' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.country}</FormLabel>
            <FormControl>
              <Select
                value={field.value.value}
                onValueChange={(val) => {
                  const sel = config.country.find((c) => c.value === val)!;
                  field.onChange(sel);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {config.country.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
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

      <FormField
        control={control}
        name="guarantee"
        rules={{
          validate: (v: Option[]) =>
            v && v.length > 0 ? undefined : 'Please select at least one',
          required: 'Please select at least one',
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.guarantee}</FormLabel>
            <FormControl>
              <MultiSelect
                options={config.guarantee}
                defaultValue={field.value.map((o) => o.value)}
                onValueChange={(vals) =>
                  field.onChange(mapOptions(config.guarantee, vals))
                }
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.guarantee ? (
              <FormDescription>
                Multiple selection possible, and if None please specify on the
                ticket
              </FormDescription>
            ) : (
              <FormMessage>
                {String(formState.errors.guarantee?.message)}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      <Message
        appearance="warning"
        text={<span>Please attach relevant documents to the task.</span>}
      />
    </>
  );
}
