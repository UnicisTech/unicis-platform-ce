import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { registerTaskTools } from "./tools/tasks.js";
import { registerComplianceTools, registerApiKeyTools } from "./tools/compliance.js";
import { registerPrivacyTools } from "./tools/privacy.js";
import { registerRiskTools } from "./tools/risk.js";

// ── Server Setup ─────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "unicis-mcp-server",
  version: "1.0.0",
});

// Register all tool groups
registerTaskTools(server);
registerComplianceTools(server);
registerApiKeyTools(server);
registerPrivacyTools(server);
registerRiskTools(server);

// ── HTTP Transport (for claude.ai web / remote access) ───────────────────────

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "unicis-mcp-server", version: "1.0.0" });
  });

  // MCP endpoint — stateless, one transport per request
  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  app.listen(port, () => {
    console.error(`Unicis MCP server running on http://localhost:${port}/mcp`);
  });
}

// ── stdio Transport (for Claude Desktop local config) ────────────────────────

async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Unicis MCP server running via stdio");
}

// ── Entry Point ──────────────────────────────────────────────────────────────

const transport = process.env.TRANSPORT || "stdio";

if (transport === "http") {
  runHTTP().catch((err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
} else {
  runStdio().catch((err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
}
