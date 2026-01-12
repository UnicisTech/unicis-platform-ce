import { RiskProbability, RiskSecurity } from 'types/pia';

export const config = {
    isDataProcessingNecessary: [
        'necessary',
        'unnecessary',
    ],
    isProportionalToPurpose: [
        'proportional',
        'not_proportional',
    ],
    confidentialityRiskProbability: [
        'rare',
        'unlikely',
        'possible',
        'probable',
        'severe',
    ],
    confidentialityRiskSecurity: [
        'insignificant',
        'minor',
        'moderate',
        'major',
        'extreme',
    ],
    availabilityRiskProbability: [
        'rare',
        'unlikely',
        'possible',
        'probable',
        'severe',
    ],
    availabilityRiskSecurity: [
        'insignificant',
        'minor',
        'moderate',
        'major',
        'extreme',
    ],
    transparencyRiskProbability: [
        'rare',
        'unlikely',
        'possible',
        'probable',
        'severe',
    ],
    transparencyRiskSecurity: [
        'insignificant',
        'minor',
        'moderate',
        'major',
        'extreme',
    ],
    dealingWithResidualRisk: [
        'acceptable',
        'acceptable_with_conditions',
        'not_acceptable',
    ],
    supervisoryAuthorityInvolvement: [
        'yes',
        'no',
    ]
}

export const steps = [
  'dataProcessing',
  'confidentialityAndIntegrity',
  'availability',
  'transparencyAndDataMinimization',
  'results',
  'correctiveMeasures'
];

export const fields = [
    "isDataProcessingNecessary",
    "isDataProcessingNecessaryAssessment",
    "isProportionalToPurpose",
    "isProportionalToPurposeAssessment",
    "confidentialityRiskProbability",
    "confidentialityRiskSecurity",
    "confidentialityAssessment",
    "availabilityRiskProbability",
    "availabilityRiskSecurity",
    "availabilityAssessment",
    "transparencyRiskProbability",
    "transparencyRiskSecurity",
    "transparencyAssessment",
    "guarantees",
    "securityMeasures",
    "securityCompliance",
    "dealingWithResidualRisk",
    "dealingWithResidualRiskAssessment",
    "supervisoryAuthorityInvolvement"
];

export const riskProbabilityPoints: Record<RiskProbability, number> = {
  rare: 0,
  unlikely: 1,
  possible: 2,
  probable: 3,
  severe: 4,
};

export const riskSecurityPoints: Record<RiskSecurity, number> = {
  insignificant: 0,
  minor: 1,
  moderate: 2,
  major: 3,
  extreme: 4,
};

export const impactLabelKeys = ['risk-level-insignificant', 'risk-level-minor', 'risk-level-moderate', 'risk-level-major', 'risk-level-extreme']
export const probabilityLabelKeys = [
  'pia:chart-risk-probability.rare',
  'pia:chart-risk-probability.unlikely',
  'pia:chart-risk-probability.possible',
  'pia:chart-risk-probability.probable',
  'pia:chart-risk-probability.almost-certian',
];