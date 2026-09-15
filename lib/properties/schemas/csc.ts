import { CSC_STATUSES } from '@/lib/csc/csc-statuses';
import { ISO_VALUES } from 'types/csc';
import { z } from 'zod';

export const isoSchema = z.enum(ISO_VALUES);
export const cscControlsSchema = z.array(z.string());
export const cscStatusSchema = z.enum(CSC_STATUSES);
export const cscStatusesSchema = z.record(z.string(), cscStatusSchema);
