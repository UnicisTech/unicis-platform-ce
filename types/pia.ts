import { Task } from "@prisma/client";
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
}

export type TaskWithPiaRisk = Task & {
  properties: {
    pia_risk: PiaRisk;
  };
};

export type TaskPiaProperties = {
  pia_risk?: PiaRisk | [];
  pia_audit_logs: AuditLog[] | [];
};