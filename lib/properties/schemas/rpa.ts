import { z, type ZodType } from 'zod';
import type { RpaProcedureInterface } from 'types/rpa';

export const rpaProcedureSchema: ZodType<RpaProcedureInterface> = z.tuple([
  z
    .object({
      reviewDate: z.string(),
      controller: z.string(),
      dpo: z.string(),
    })
    .passthrough(),
  z
    .object({
      purpose: z.string().optional(),
      category: z.array(z.string()),
      datasubject: z.array(z.string()),
      retentionperiod: z.string(),
      specialcategory: z.array(z.string()),
      commentsretention: z.string().optional(),
    })
    .passthrough(),
  z
    .object({
      recipientType: z.string(),
      recipientdetails: z.string().optional(),
    })
    .passthrough(),
  z
    .object({
      datatransfer: z.boolean(),
      recipient: z.string(),
      country: z.string(),
      guarantee: z.array(z.string()),
    })
    .passthrough(),
  z
    .object({
      toms: z.array(z.string()),
    })
    .passthrough(),
  z
    .object({
      involveProfiling: z.string(),
      useAutomated: z.string(),
      involveSurveillance: z.string(),
      processedSpecialCategories: z.string(),
      isBigData: z.string(),
      dataSetsCombined: z.string(),
      multipleControllers: z.string(),
      imbalanceInRelationship: z.string(),
      innovativeTechnologyUsed: z.string(),
      transferredOutside: z.string(),
      rightsRestricted: z.string(),
      piaNeeded: z.string(),
    })
    .passthrough(),
]);
