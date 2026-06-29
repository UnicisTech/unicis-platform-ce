import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  apiGet, apiPost, apiPut, apiDelete, apiPostMultipart,
  Task, CreateTaskInput, UpdateTaskInput,
  stripHtml, formatDate,
} from "../services/api.js";

export function registerTaskTools(server: McpServer): void {

  // ── List Tasks ────────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_list_tasks",
    {
      title: "List Tasks",
      description: `List all tasks for a Unicis team.

Returns task number, title, status, priority, due date, and assigned controls.

Args:
  - slug (string): Team slug (e.g. "unicis")
  - status (string, optional): Filter by status — "todo" | "inprogress" | "done"
  - priority (string, optional): Filter by priority — "low" | "medium" | "high"

Returns: Array of tasks with id, taskNumber, title, status, priority, duedate, controls.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug, e.g. 'unicis'"),
        status: z.enum(["todo", "inprogress", "done"]).optional().describe("Filter by status"),
        priority: z.enum(["low", "medium", "high"]).optional().describe("Filter by priority"),
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, status, priority }) => {
      const tasks = await apiGet<Task[]>(`/api/teams/${slug}/tasks`);
      let filtered = tasks;
      if (status) filtered = filtered.filter(t => t.status === status);
      if (priority) filtered = filtered.filter(t => t.priority === priority);

      if (!filtered.length) {
        return { content: [{ type: "text", text: "No tasks found matching the given filters." }] };
      }

      const lines = filtered.map(t => {
        const controls = extractControls(t);
        return [
          `**#${t.taskNumber} — ${t.title}**`,
          `  Status: ${t.status} | Priority: ${t.priority} | Due: ${formatDate(t.duedate)}`,
          controls.length ? `  Controls: ${controls.join(", ")}` : "",
        ].filter(Boolean).join("\n");
      });

      const output = { total: tasks.length, filtered: filtered.length, tasks: filtered };
      return {
        content: [{ type: "text", text: `## Tasks (${filtered.length}/${tasks.length})\n\n${lines.join("\n\n")}` }],
        structuredContent: output,
      };
    }
  );

  // ── Get Task ──────────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_get_task",
    {
      title: "Get Task",
      description: `Get full details of a single Unicis task by task number.

Returns title, status, priority, due date, full description, controls, risk data,
comments, attachments, and any linked RoPA/TIA/PIA/Risk Management data.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number (e.g. 1, 2, 3...)

Returns: Full task object including all properties.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, taskNumber }) => {
      const task = await apiGet<Task>(`/api/teams/${slug}/tasks/${taskNumber}`);
      const controls = extractControls(task);
      const risk = task.properties?.rm_risk as Record<string, unknown>[] | undefined;
      const comments = task.comments || [];
      const attachments = task.attachments || [];

      const lines = [
        `## #${task.taskNumber} — ${task.title}`,
        `**Status:** ${task.status} | **Priority:** ${task.priority} | **Due:** ${formatDate(task.duedate)}`,
        ``,
        `### Description`,
        stripHtml(task.description) || "_No description_",
        ``,
        controls.length ? `### Controls\n${controls.map(c => `- ${c}`).join("\n")}` : "",
        risk?.length ? `### Risk Assessment\n- Raw Impact: ${risk[0]?.RawImpact} | Raw Probability: ${risk[0]?.RawProbability}` : "",
        comments.length ? `### Comments (${comments.length})\n${comments.map(c => `- **${c.createdBy?.name || "Unknown"}**: ${c.text}`).join("\n")}` : "",
        attachments.length ? `### Attachments (${attachments.length})\n${attachments.map(a => `- ${a.filename} (id: ${a.id})`).join("\n")}` : "",
        task.properties?.rpa_procedure ? "### RoPA: linked (use unicis_get_ropa to read)" : "",
        task.properties?.tia_procedure ? "### TIA: linked (use unicis_get_tia to read)" : "",
        task.properties?.pia_procedure ? "### PIA: linked (use unicis_get_pia to read)" : "",
      ].filter(Boolean).join("\n");

      return {
        content: [{ type: "text", text: lines }],
        structuredContent: task,
      };
    }
  );

  // ── Create Task ───────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_create_task",
    {
      title: "Create Task",
      description: `Create a new task in a Unicis team.

Args:
  - slug (string): Team slug
  - title (string): Task title (required)
  - status (string, optional): "todo" | "inprogress" | "done" (default: "todo")
  - priority (string, optional): "low" | "medium" | "high" (default: "medium")
  - description (string, optional): Task description (HTML supported)
  - duedate (string, optional): ISO 8601 date string, e.g. "2026-12-31T23:59:59.000Z"
  - controls (string[], optional): Control IDs to assign immediately, e.g. ["mvsp-1-6", "iso-2022-a-5-1"]

Returns: Created task object with assigned taskNumber.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        title: z.string().min(1).max(500).describe("Task title"),
        status: z.enum(["todo", "inprogress", "done"]).default("todo").describe("Task status"),
        priority: z.enum(["low", "medium", "high"]).default("medium").describe("Task priority"),
        description: z.string().optional().describe("Task description (HTML supported)"),
        duedate: z.string().optional().describe("Due date in ISO 8601 format"),
        controls: z.array(z.string()).optional().describe("Control IDs to assign immediately"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ slug, title, status, priority, description, duedate, controls }) => {
      const body: CreateTaskInput & { controls?: string[] } = {
        title, status, priority, description, duedate, controls,
      };
      const task = await apiPost<Task>(`/api/teams/${slug}/tasks`, body);
      return {
        content: [{ type: "text", text: `✅ Task #${task.taskNumber} created: **${task.title}**\nStatus: ${task.status} | Priority: ${task.priority}` }],
        structuredContent: task,
      };
    }
  );

  // ── Update Task ───────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_update_task",
    {
      title: "Update Task",
      description: `Update an existing Unicis task. Only provided fields are changed.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number to update
  - title (string, optional): New title
  - status (string, optional): New status — "todo" | "inprogress" | "done"
  - priority (string, optional): New priority — "low" | "medium" | "high"
  - description (string, optional): New description
  - duedate (string, optional): New due date in ISO 8601 format

Returns: Updated task object.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number to update"),
        title: z.string().min(1).max(500).optional().describe("New title"),
        status: z.enum(["todo", "inprogress", "done"]).optional().describe("New status"),
        priority: z.enum(["low", "medium", "high"]).optional().describe("New priority"),
        description: z.string().optional().describe("New description"),
        duedate: z.string().optional().describe("New due date in ISO 8601 format"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, taskNumber, ...updates }) => {
      const body: UpdateTaskInput = updates;
      // The task PUT endpoint reads from req.body.data (not req.body directly)
      const task = await apiPut<Task>(`/api/teams/${slug}/tasks/${taskNumber}`, { data: body });
      return {
        content: [{ type: "text", text: `✅ Task #${task.taskNumber} updated: **${task.title}**\nStatus: ${task.status} | Priority: ${task.priority} | Due: ${formatDate(task.duedate)}` }],
        structuredContent: task,
      };
    }
  );

  // ── Delete Task ───────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_delete_task",
    {
      title: "Delete Task",
      description: `Permanently delete a Unicis task. This action is irreversible.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number to delete

Returns: Confirmation message.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number to delete"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ slug, taskNumber }) => {
      await apiDelete(`/api/teams/${slug}/tasks/${taskNumber}`);
      return {
        content: [{ type: "text", text: `🗑️ Task #${taskNumber} has been permanently deleted.` }],
      };
    }
  );

  // ── Update Controls ───────────────────────────────────────────────────────
  server.registerTool(
    "unicis_update_task_controls",
    {
      title: "Update Task Controls",
      description: `Add, remove, or replace compliance controls assigned to a task.

Uses operation/ISO fields matching the platform API. Detect the framework from the
control ID prefix: mvsp-* → ISO="mvsp", iso-2022-* → ISO="iso-2022",
iso-2013-* → ISO="iso-2013", etc.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number
  - controls (string[]): Array of control IDs (e.g. ["mvsp-1-6", "iso-2022-a-5-1"])
  - operation (string): "add" | "remove" | "change"
  - ISO (string): Framework key — "mvsp" | "iso-2022" | "iso-2013" | "nistcsfv2" | "eunis2" | "gdpr" | "cisv81" | "soc2v2" | "c5_2020" | "owasp_asvs_v5" | "pcidss_v401" | "iso42001"

Returns: Confirmation.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
        controls: z.array(z.string()).min(1).describe("Control IDs"),
        operation: z.enum(["add", "remove", "change"]).describe("Operation to perform"),
        ISO: z.enum(["mvsp", "iso-2022", "iso-2013", "nistcsfv2", "eunis2", "gdpr", "cisv81", "soc2v2", "c5_2020", "owasp_asvs_v5", "pcidss_v401", "iso42001"])
          .describe("Framework identifier"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ slug, taskNumber, controls, operation, ISO }) => {
      await apiPut(`/api/teams/${slug}/tasks/${taskNumber}/csc`, { controls, operation, ISO });
      return {
        content: [{ type: "text", text: `✅ Controls updated on task #${taskNumber}.\nOperation: ${operation} | ISO: ${ISO} | Controls: ${controls.join(", ")}` }],
      };
    }
  );

  // ── Add Comment ───────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_add_comment",
    {
      title: "Add Comment to Task",
      description: `Add a comment to a Unicis task.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number
  - text (string): Comment text (HTML supported)

Returns: Created comment object.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
        text: z.string().min(1).describe("Comment text (HTML supported)"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ slug, taskNumber, text }) => {
      const comment = await apiPost<Record<string, unknown>>(`/api/teams/${slug}/tasks/${taskNumber}/comments`, { text });
      return {
        content: [{ type: "text", text: `✅ Comment added to task #${taskNumber}.` }],
        structuredContent: comment,
      };
    }
  );

  // ── List Attachments ──────────────────────────────────────────────────────
  server.registerTool(
    "unicis_list_attachments",
    {
      title: "List Task Attachments",
      description: `List all file attachments on a Unicis task.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number

Returns: Array of attachment objects with id, filename, url.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ slug, taskNumber }) => {
      const task = await apiGet<Task>(`/api/teams/${slug}/tasks/${taskNumber}`);
      const attachments = task.attachments || [];
      if (!attachments.length) {
        return { content: [{ type: "text", text: `No attachments on task #${taskNumber}.` }] };
      }
      const lines = attachments.map(a => `- **${a.filename}** (id: \`${a.id}\`)`);
      return {
        content: [{ type: "text", text: `## Attachments on task #${taskNumber} (${attachments.length})\n\n${lines.join("\n")}` }],
        structuredContent: { items: attachments } as Record<string, unknown>,
      };
    }
  );

  // ── Add Attachment ────────────────────────────────────────────────────────
  server.registerTool(
    "unicis_add_attachment",
    {
      title: "Add Attachment to Task",
      description: `Upload a file attachment to a Unicis task. Maximum file size: 10 MB.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number
  - filename (string): Display name for the file (e.g. "report.pdf")
  - content (string): Base64-encoded file content
  - mimeType (string): MIME type (e.g. "application/pdf", "image/png", "text/csv")

Returns: Confirmation with the uploaded file URL.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
        filename: z.string().min(1).describe("Filename, e.g. 'report.pdf'"),
        content: z.string().min(1).describe("Base64-encoded file content"),
        mimeType: z.string().min(1).describe("MIME type, e.g. 'application/pdf'"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ slug, taskNumber, filename, content, mimeType }) => {
      // Fetch the task to get its internal database id
      const task = await apiGet<Task>(`/api/teams/${slug}/tasks/${taskNumber}`);

      // Decode base64 and build FormData
      const buffer = Buffer.from(content, "base64");
      const formData = new FormData();
      formData.append("taskId", String(task.id));
      formData.append(
        "file",
        new Blob([buffer], { type: mimeType }),
        filename
      );

      const result = await apiPostMultipart<Record<string, unknown>>(
        `/api/teams/${slug}/tasks/${taskNumber}/attachments`,
        formData
      );

      return {
        content: [{ type: "text", text: `✅ File "${filename}" uploaded to task #${taskNumber}.\nURL: ${(result as { url?: string })?.url ?? "N/A"}` }],
        structuredContent: result,
      };
    }
  );

  // ── Remove Attachment ─────────────────────────────────────────────────────
  server.registerTool(
    "unicis_remove_attachment",
    {
      title: "Remove Task Attachment",
      description: `Remove a file attachment from a Unicis task.

Args:
  - slug (string): Team slug
  - taskNumber (number): Task number
  - attachmentId (string): Attachment ID (from unicis_list_attachments)

Returns: Confirmation.`,
      inputSchema: z.object({
        slug: z.string().describe("Team slug"),
        taskNumber: z.number().int().positive().describe("Task number"),
        attachmentId: z.string().min(1).describe("Attachment ID from unicis_list_attachments"),
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ slug, taskNumber, attachmentId }) => {
      await apiDelete(`/api/teams/${slug}/tasks/${taskNumber}/attachments?id=${attachmentId}`);
      return {
        content: [{ type: "text", text: `✅ Attachment \`${attachmentId}\` removed from task #${taskNumber}.` }],
      };
    }
  );
}

function extractControls(task: Task): string[] {
  return [
    ...((task.properties?.['csc_controls_mvsp'] as string[]) || []),
    ...((task.properties?.['csc_controls_iso-2022'] as string[]) || []),
    ...((task.properties?.['csc_controls_iso-2013'] as string[]) || []),
    ...((task.properties?.csc_controls_nistcsfv2 as string[]) || []),
    ...((task.properties?.csc_controls_eunis2 as string[]) || []),
    ...((task.properties?.csc_controls_gdpr as string[]) || []),
    ...((task.properties?.csc_controls_cisv81 as string[]) || []),
    ...((task.properties?.csc_controls_soc2v2 as string[]) || []),
    ...((task.properties?.csc_controls_c5_2020 as string[]) || []),
    ...((task.properties?.csc_controls_owasp_asvs_v5 as string[]) || []),
    ...((task.properties?.csc_controls_pcidss_v401 as string[]) || []),
    ...((task.properties?.csc_controls_iso42001 as string[]) || []),
  ].filter(c => typeof c === "string");
}
