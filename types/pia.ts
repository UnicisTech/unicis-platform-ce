import { AuditLog } from "./base";

export type RiskProbability = "rare" | "unlikely" | "possible" | "probable" | "severe"

export type RiskSecurity = "insignificant" | "minor" | "moderate" | "major" | "extreme"

type Option = {
  label: string | any;
  value: string;
};

export type PiaRisk = [
  {
    isDataProcessingNecessary: "necessary" | "unnecessary",
    isDataProcessingNecessaryAssessment: string,
    isProportionalToPurpose: "proportional" | "not_proportional",
    isProportionalToPurposeAssessment: string,
  },
  {
    confidentialityRiskProbability: RiskProbability,
    confidentialityRiskSecurity: RiskSecurity,
    confidentialityAssessment: string,
  },
  {
    availabilityRiskProbability: RiskProbability,
    availabilityRiskSecurity: RiskSecurity,
    availabilityAssessment: string,
  },
  {
    transparencyRiskProbability: RiskProbability,
    transparencyRiskSecurity: RiskSecurity,
    transparencyAssessment: string,
  },
  {
    guarantees: string,
    securityMeasures: string,
    securityCompliance: string,
    dealingWithResidualRisk: "acceptable" | "acceptable_with_conditions" |  "not_acceptable",
    dealingWithResidualRiskAssessment: string,
    supervisoryAuthorityInvolvement: "yes" | "no",
  } | null
]

export interface PiaConfig {
  isDataProcessingNecessary: Option[]
  isProportionalToPurpose: Option[]
  confidentialityRiskProbability: Option[],
  confidentialityRiskSecurity: Option[],
  availabilityRiskProbability: Option[],
  availabilityRiskSecurity: Option[],
  transparencyRiskProbability: Option[],
  transparencyRiskSecurity: Option[],
  dealingWithResidualRisk: Option[],
  supervisoryAuthorityInvolvement: Option[],
  // category: RpaOption[];
  // specialcategory: RpaOption[];
  // datasubject: RpaOption[];
  // retentionperiod: RpaOption[];
  // recipientType: RpaOption[];
  // guarantee: RpaOption[];
  // toms: RpaOption[];
  // country: RpaOption[];
  // involveProfiling: RpaOption[];
  // useAutomated: RpaOption[];
  // involveSurveillance: RpaOption[];
  // processedSpecialCategories: RpaOption[];
  // isBigData: RpaOption[];
  // dataSetsCombined: RpaOption[];
  // multipleControllers: RpaOption[];
  // imbalanceInRelationship: RpaOption[];
  // innovativeTechnologyUsed: RpaOption[];
  // transferredOutside: RpaOption[];
  // rightsRestricted: RpaOption[];
  // piaNeeded: RpaOption[];
}

export type TaskPiaProperties = {
  pia_risk?: PiaRisk | [];
  pia_audit_logs: AuditLog[] | [];
};