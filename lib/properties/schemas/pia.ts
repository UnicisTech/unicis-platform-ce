import { z, type ZodType } from 'zod';
import type { PiaRisk } from 'types/pia';

const riskProbabilitySchema = z.enum([
  'rare',
  'unlikely',
  'possible',
  'probable',
  'severe',
]);

const riskSecuritySchema = z.enum([
  'insignificant',
  'minor',
  'moderate',
  'major',
  'extreme',
]);

export const piaRiskSchema: ZodType<PiaRisk> = z.tuple([
  z
    .object({
      isDataProcessingNecessary: z.enum(['necessary', 'unnecessary']),
      isDataProcessingNecessaryAssessment: z.string(),
      isProportionalToPurpose: z.enum(['proportional', 'not_proportional']),
      isProportionalToPurposeAssessment: z.string(),
    })
    .passthrough(),
  z
    .object({
      confidentialityRiskProbability: riskProbabilitySchema,
      confidentialityRiskSecurity: riskSecuritySchema,
      confidentialityAssessment: z.string(),
    })
    .passthrough(),
  z
    .object({
      availabilityRiskProbability: riskProbabilitySchema,
      availabilityRiskSecurity: riskSecuritySchema,
      availabilityAssessment: z.string(),
    })
    .passthrough(),
  z
    .object({
      transparencyRiskProbability: riskProbabilitySchema,
      transparencyRiskSecurity: riskSecuritySchema,
      transparencyAssessment: z.string(),
    })
    .passthrough(),
  z
    .object({
      guarantees: z.string(),
      securityMeasures: z.string(),
      securityCompliance: z.string(),
      dealingWithResidualRisk: z.enum([
        'acceptable',
        'acceptable_with_conditions',
        'not_acceptable',
      ]),
      dealingWithResidualRiskAssessment: z.string(),
      supervisoryAuthorityInvolvement: z.enum(['yes', 'no']),
    })
    .passthrough()
    .nullable(),
]);
