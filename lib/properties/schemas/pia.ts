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

const processingSchema = z
  .object({
    isDataProcessingNecessary: z.enum(['necessary', 'unnecessary']),
    isDataProcessingNecessaryAssessment: z.string(),
    isProportionalToPurpose: z.enum(['proportional', 'not_proportional']),
    isProportionalToPurposeAssessment: z.string(),
  })
  .passthrough();

const confidentialitySchema = z
  .object({
    confidentialityRiskProbability: riskProbabilitySchema,
    confidentialityRiskSecurity: riskSecuritySchema,
    confidentialityAssessment: z.string(),
  })
  .passthrough();

const availabilitySchema = z
  .object({
    availabilityRiskProbability: riskProbabilitySchema,
    availabilityRiskSecurity: riskSecuritySchema,
    availabilityAssessment: z.string(),
  })
  .passthrough();

const transparencySchema = z
  .object({
    transparencyRiskProbability: riskProbabilitySchema,
    transparencyRiskSecurity: riskSecuritySchema,
    transparencyAssessment: z.string(),
  })
  .passthrough();

const correctiveMeasuresSchema = z
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
  .nullable();

const piaCoreRiskSchema = z.tuple([
  processingSchema,
  confidentialitySchema,
  availabilitySchema,
  transparencySchema,
]);

const piaFullRiskSchema = z.tuple([
  processingSchema,
  confidentialitySchema,
  availabilitySchema,
  transparencySchema,
  correctiveMeasuresSchema,
]);

export const piaRiskSchema: ZodType<PiaRisk> = z.union([
  piaFullRiskSchema,
  piaCoreRiskSchema.transform((risk) => [...risk, null] as PiaRisk),
]);
