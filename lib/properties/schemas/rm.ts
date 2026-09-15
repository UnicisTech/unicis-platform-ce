import { z, type ZodType } from 'zod';
import type { RMProcedureInterface } from 'types/rm';

export const rmRiskSchema: ZodType<RMProcedureInterface> = z.tuple([
  z
    .object({
      Risk: z.string(),
      AssetOwner: z.string(),
      Impact: z.string(),
      RawProbability: z.number(),
      RawImpact: z.number(),
    })
    .passthrough(),
  z
    .object({
      RiskTreatment: z.string(),
      TreatmentCost: z.string(),
      TreatmentStatus: z.number(),
      TreatedProbability: z.number(),
      TreatedImpact: z.number(),
    })
    .passthrough(),
]);
