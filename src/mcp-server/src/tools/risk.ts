import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiDelete, Task, RmRisk } from "../services/api.js";

export function registerRiskTools(server: McpServer): void {

  // ── Get Risk ──────────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_get_risk",
    {
      title: "Get Risk Assessment for Task",
      description: `Get the Risk Management (RM) data linked to a task.

Risk data is stored as a 2-step array inside task properties:
  [0] Risk info: { Risk, AssetOwner, Impact, RawProbability (0–100), RawImpact (0–100) }
  [1] Treatment: { RiskTreatment, TreatmentCost, TreatmentStatus (0–100),
                   TreatedProbability (0–100), TreatedImpact (0–100) }

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number

Returns: Risk assessment data or indication it is not set.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, taskNumber }) => {
      const task = await apiGet<Task>(`/api/teams/${slug}/tasks/${taskNumber}`);
      const risk = task.properties?.rm_risk as RmRisk[] | undefined;
      if (!risk?.length) {
        return { content: [{ type: "text", text: `No risk assessment linked to task #${taskNumber}.` }] };
      }
      const info = risk[0] || {};
      const treatment = risk[1] || {};
      const lines = [
        `## Risk Assessment for task #${taskNumber}`,
        `**Risk:** ${info.Risk ?? "—"} | **Asset Owner:** ${info.AssetOwner ?? "—"}`,
        `**Impact:** ${info.Impact ?? "—"}`,
        `**Raw Probability:** ${info.RawProbability ?? "—"} | **Raw Impact:** ${info.RawImpact ?? "—"}`,
        ``,
        `### Treatment`,
        `**Strategy:** ${treatment.RiskTreatment ?? "—"} | **Cost:** ${treatment.TreatmentCost ?? "—"}`,
        `**Status:** ${treatment.TreatmentStatus ?? "—"}%`,
        `**Treated Probability:** ${treatment.TreatedProbability ?? "—"} | **Treated Impact:** ${treatment.TreatedImpact ?? "—"}`,
      ].join("\n");
      return {
        content: [{ type: "text", text: lines }],
        structuredContent: { items: risk } as Record<string, unknown>,
      };
    }
  );

  // ── Set Risk ──────────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_set_risk",
    {
      title: "Set Risk Assessment for Task",
      description: `Create or update the Risk Management assessment on a task.

The risk is stored as a 2-element array:
  [0] { Risk: string, AssetOwner: string, Impact: string,
        RawProbability: number (0-100), RawImpact: number (0-100) }
  [1] { RiskTreatment: string, TreatmentCost: string, TreatmentStatus: number (0-100),
        TreatedProbability: number (0-100), TreatedImpact: number (0-100) }

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number
  - risk (object): Risk info — Risk, AssetOwner, Impact, RawProbability, RawImpact
  - treatment (object): Treatment info — RiskTreatment, TreatmentCost, TreatmentStatus, TreatedProbability, TreatedImpact

Returns: Confirmation.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
        risk: z.object({
          Risk: z.string().describe("Risk description"),
          AssetOwner: z.string().describe("Asset owner (person responsible)"),
          Impact: z.string().describe("Impact description"),
          RawProbability: z.number().min(0).max(100).describe("Raw probability score 0-100"),
          RawImpact: z.number().min(0).max(100).describe("Raw impact score 0-100"),
        }).describe("Risk identification data"),
        treatment: z.object({
          RiskTreatment: z.string().describe("Treatment strategy (e.g. mitigate, accept, transfer)"),
          TreatmentCost: z.string().describe("Estimated treatment cost"),
          TreatmentStatus: z.number().min(0).max(100).describe("Treatment completion percentage 0-100"),
          TreatedProbability: z.number().min(0).max(100).describe("Residual probability after treatment 0-100"),
          TreatedImpact: z.number().min(0).max(100).describe("Residual impact after treatment 0-100"),
        }).describe("Risk treatment data"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, taskNumber, risk, treatment }) => {
      const task = await apiGet<Task>(`/api/teams/${slug}/tasks/${taskNumber}`);
      const prevRisk = (task.properties?.rm_risk as RmRisk[]) ?? [];
      const nextRisk = [risk, treatment];
      await apiPost(
        `/api/teams/${slug}/tasks/${taskNumber}/rm`,
        { prevRisk, nextRisk }
      );
      return {
        content: [{ type: "text", text: `✅ Risk assessment saved on task #${taskNumber}.\nRaw score: ${risk.RawProbability * risk.RawImpact / 100} | Residual score: ${treatment.TreatedProbability * treatment.TreatedImpact / 100}` }],
      };
    }
  );

  // ── Delete Risk ───────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_delete_risk",
    {
      title: "Delete Risk Assessment from Task",
      description: `Remove the Risk Management assessment from a task.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number

Returns: Confirmation.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, taskNumber }) => {
      await apiDelete(`/api/teams/${slug}/tasks/${taskNumber}/rm`);
      return {
        content: [{ type: "text", text: `✅ Risk assessment removed from task #${taskNumber}.` }],
      };
    }
  );

  // ── List Tasks with Risk ──────────────────────────────────────────────────
  server.registerTool(
    "unicis_list_risks",
    {
      title: "List All Risk Assessments",
      description: `List all tasks that have a risk assessment, with their risk scores.

Args:
  - slug (string): Team slug
  - minRawScore (number, optional): Only return risks with RawProbability * RawImpact / 100 >= this value

Returns: Tasks with risk data, sorted by descending raw score.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        minRawScore: z.number().min(0).max(100).optional().describe("Minimum risk score filter"),
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, minRawScore }) => {
      const tasks = await apiGet<Task[]>(`/api/teams/${slug}/tasks`);
      const withRisk = tasks
        .filter(t => Array.isArray(t.properties?.rm_risk) && (t.properties.rm_risk as unknown[]).length > 0)
        .map(t => {
          const risk = (t.properties!.rm_risk as RmRisk[])[0] || {};
          const rawScore = ((risk.RawProbability ?? 0) * (risk.RawImpact ?? 0)) / 100;
          return { task: t, risk, rawScore };
        })
        .filter(r => minRawScore === undefined || r.rawScore >= minRawScore)
        .sort((a, b) => b.rawScore - a.rawScore);

      if (!withRisk.length) {
        return { content: [{ type: "text", text: "No risk assessments found." }] };
      }

      const lines = withRisk.map(r =>
        `**#${r.task.taskNumber} — ${r.task.title}**\n` +
        `  Risk: ${r.risk.Risk ?? "—"} | Owner: ${r.risk.AssetOwner ?? "—"}\n` +
        `  Raw score: ${r.rawScore.toFixed(0)} (P:${r.risk.RawProbability ?? "?"}% × I:${r.risk.RawImpact ?? "?"}%)`
      );

      return {
        content: [{ type: "text", text: `## Risk Register (${withRisk.length} items)\n\n${lines.join("\n\n")}` }],
        structuredContent: { items: withRisk.map(r => ({ taskNumber: r.task.taskNumber, title: r.task.title, risk: r.risk, rawScore: r.rawScore })) } as Record<string, unknown>,
      };
    }
  );
}
