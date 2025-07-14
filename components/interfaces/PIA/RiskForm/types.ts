export type ConfidentialityStepValues = {
  confidentialityRiskProbability: string;
  confidentialityRiskSecurity: string;
  confidentialityAssessment: string;
};

export type AvailabilityStepValues = {
  availabilityRiskProbability: string;
  availabilityRiskSecurity: string;
  availabilityAssessment: string;
};

export type CorrectiveMeasuresStepValues = {
  guarantees: string;
  securityMeasures: string;
  securityCompliance: string;
  dealingWithResidualRisk: string;
  dealingWithResidualRiskAssessment: string;
  supervisoryAuthorityInvolvement: string;
};

export type DataProcessingStepValues = {
  isDataProcessingNecessary: string;
  isDataProcessingNecessaryAssessment: string;
  isProportionalToPurpose: string;
  isProportionalToPurposeAssessment: string;
};

export type TransparencyStepValues = {
  transparencyRiskProbability: string;
  transparencyRiskSecurity: string;
  transparencyAssessment: string;
};
