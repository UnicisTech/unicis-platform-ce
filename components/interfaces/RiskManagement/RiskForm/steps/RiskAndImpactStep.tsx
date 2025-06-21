'use client';

import * as React from 'react';
import { useRouter } from 'next/router';
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
import { Slider } from '@/components/shadcn/ui/slider';
import useTeamMembers from 'hooks/useTeamMembers';
import { Error, Loading } from '@/components/shared';
import type { RiskAndImpactStepValues } from '../types';
import type { Option } from 'types';

export interface RiskAndImpactStepProps {
  control: Control<RiskAndImpactStepValues>;
}

export default function RiskAndImpactStep({ control }: RiskAndImpactStepProps) {
  const router = useRouter();
  const { slug } = router.query;
  const { isLoading, isError, members } = useTeamMembers(slug as string);

  if (isLoading) return <Loading />;
  if (isError || !members) return <Error message={isError?.message} />;

  // build select options from team members
  const ownerOptions: Option[] = members.map(({ user }) => ({
    value: user.id,
    label: user.name,
  }));

  return (
    <>
      <FormField
        control={control}
        name="Risk"
        rules={{ required: 'Please describe the risk.' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Risk</FormLabel>
            <FormDescription>
              Describe the information security risk briefly so that people will
              understand what risk you are assessing.
            </FormDescription>
            <FormControl>
              <Textarea {...field} placeholder="Enter risk description" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="AssetOwner"
        rules={{ required: 'Please select an asset owner.' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Asset Owner</FormLabel>
            <FormControl>
              <Select
                value={field.value.value}
                onValueChange={(val) => {
                  const sel = ownerOptions.find((o) => o.value === val)!;
                  field.onChange(sel);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an owner" />
                </SelectTrigger>
                <SelectContent>
                  {ownerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <FormDescription>
              Who is the Information Asset Owner, the person accountable if the
              risk treatments are inadequate, incidents occur, and the
              organization is adversely impacted? This person must assess and
              treat risks adequately.
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="Impact"
        rules={{ required: 'Please describe the impact.' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Impact</FormLabel>
            <FormDescription>
              Describe the potential impacts in business terms if the risk
              occurs. Decide whether to use &quot;worst case&quot; or
              &quot;anticipated&quot; impacts consistently.
            </FormDescription>
            <FormControl>
              <Textarea {...field} placeholder="Enter impact description" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="RawProbability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Raw Probability (%)</FormLabel>
            <FormDescription>
              Enter the likelihood that the risk would occur untreated, as a
              percentage value.
            </FormDescription>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={100}
                step={1}
              />
            </FormControl>
            <FormDescription>{`${field.value}% (max. 100)`}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="RawImpact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Raw Impact</FormLabel>
            <FormDescription>
              Enter the potential business impact if the risk occurred without
              any treatment, as a percentage value.
            </FormDescription>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={100}
                step={1}
              />
            </FormControl>
            <FormDescription>{`${field.value}% (max. 100)`}</FormDescription>
          </FormItem>
        )}
      />
    </>
  );
}
