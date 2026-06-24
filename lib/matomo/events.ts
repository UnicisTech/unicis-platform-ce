// Matomo event taxonomy.
//
// Each Action below is globally unique on purpose: Matomo Goals can only match
// on ONE event dimension (Category, Action, or Name), never a combination.
// Keeping Action unique per trackable milestone means every milestone can be
// turned into a Goal with a simple "Action exactly equals ..." rule, with no
// risk of colliding with an unrelated event elsewhere in the taxonomy.
//
// Category is kept for grouping/reporting only — never rely on it (combined
// with Action or Name) to define a Goal.
//
// Name/value fields must only ever be enums, counts, or categorical buckets —
// never free text sourced from user-entered data (org names, task titles,
// control descriptions, risk descriptions, comments, etc).

export const MatomoCategory = {
  Onboarding: 'Onboarding',
  CscCompliance: 'CSC-Compliance',
  Task: 'Task',
  Assessment: 'Assessment',
  Risk: 'Risk',
  Export: 'Export',
  Mcp: 'MCP',
  Billing: 'Billing',
  VendorAssessment: 'Vendor-Assessment',
  Handbook: 'Handbook',
} as const;

export const MatomoEvent = {
  // Onboarding funnel
  OrgCreated: {
    category: MatomoCategory.Onboarding,
    action: 'Org-Created',
  },
  FirstUserInvited: {
    category: MatomoCategory.Onboarding,
    action: 'First-User-Invited',
  },
  TierSelected: {
    category: MatomoCategory.Onboarding,
    action: 'Tier-Selected',
  },
  FirstFrameworkSelected: {
    category: MatomoCategory.Onboarding,
    action: 'First-Framework-Selected',
  },
  OnboardingAbandoned: {
    category: MatomoCategory.Onboarding,
    action: 'Onboarding-Abandoned',
  },

  // CSC compliance
  CscStatusUpdate: {
    category: MatomoCategory.CscCompliance,
    action: 'Status-Update',
  },

  // Task lifecycle
  TaskCreate: { category: MatomoCategory.Task, action: 'Task-Create' },
  TaskComplete: { category: MatomoCategory.Task, action: 'Task-Complete' },
  TaskAssign: { category: MatomoCategory.Task, action: 'Task-Assign' },

  // Assessments
  RopaSaved: { category: MatomoCategory.Assessment, action: 'RoPA-Saved' },
  TiaSaved: { category: MatomoCategory.Assessment, action: 'TIA-Saved' },
  PiaSaved: { category: MatomoCategory.Assessment, action: 'PIA-Saved' },

  // Risk management
  RiskCreated: { category: MatomoCategory.Risk, action: 'Risk-Created' },
  RiskScored: { category: MatomoCategory.Risk, action: 'Risk-Scored' },

  // Exports
  SoaExport: { category: MatomoCategory.Export, action: 'SoA-Export' },
  ReportExport: {
    category: MatomoCategory.Export,
    action: 'Report-Export',
  },

  // MCP server (tracked server-side from unicis-mcp-server, not this app)
  McpToolInvoked: { category: MatomoCategory.Mcp, action: 'Tool-Invoked' },
  McpToolError: { category: MatomoCategory.Mcp, action: 'Tool-Error' },

  // Billing
  TierUpgradeClick: {
    category: MatomoCategory.Billing,
    action: 'Tier-Upgrade-Click',
  },
  TierUpgradeComplete: {
    category: MatomoCategory.Billing,
    action: 'Tier-Upgrade-Complete',
  },

  // Vendor assessment (not yet implemented in the platform — placeholder)
  QuestionnaireSent: {
    category: MatomoCategory.VendorAssessment,
    action: 'Questionnaire-Sent',
  },
  QuestionnaireCompleted: {
    category: MatomoCategory.VendorAssessment,
    action: 'Questionnaire-Completed',
  },
} as const;

export type RiskLevelBucket = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskTypeEnum =
  | 'Compliance-Task'
  | 'Audit-Task'
  | 'Risk-Task'
  | 'PIA-Task'
  | 'TIA-Task'
  | 'RoPA-Task';
export type SoaExportFormat = 'XLSX' | 'ODS' | 'PDF' | 'HTML';
export type FrameworkName =
  | 'ISO27001'
  | 'NIS2'
  | 'GDPR'
  | 'DORA'
  | 'CRA';
